package com.foodorder.foodorderapp.service;

import com.foodorder.foodorderapp.dto.CategoryDto;
import com.foodorder.foodorderapp.dto.RestaurantDto;
import com.foodorder.foodorderapp.entity.AccountStatus;
import com.foodorder.foodorderapp.entity.Restaurant;
import com.foodorder.foodorderapp.entity.RestaurantCategory;
import com.foodorder.foodorderapp.entity.User;
import com.foodorder.foodorderapp.entity.UserRole;
import com.foodorder.foodorderapp.repository.AccountStatusRepository;
import com.foodorder.foodorderapp.repository.RestaurantCategoryRepository;
import com.foodorder.foodorderapp.repository.RestaurantRepository;
import com.foodorder.foodorderapp.repository.UserRepository;
import com.foodorder.foodorderapp.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    private final AccountStatusRepository accountStatusRepository;
    private final UserRoleRepository userRoleRepository;

    public List<RestaurantDto> findAllForUser(String userLogin) {

        User user = null;

        if (userLogin != null) {
            user = userRepository.findByLogin(userLogin).orElse(null);
        }

        boolean isOwnerOrAdmin = user != null
                && user.getRoles() != null
                && user.getRoles().stream().anyMatch(r ->
                "OWNER".equalsIgnoreCase(r.getRoleName())
                        || "ADMIN".equalsIgnoreCase(r.getRoleName())
        );

        List<Restaurant> list = isOwnerOrAdmin
                ? restaurantRepository.findAll()
                : restaurantRepository.findAllByIsApproved(1);

        return list.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public RestaurantDto findById(Integer id) {

        Restaurant r = restaurantRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Restauracja nie istnieje"
                )
        );

        return toDto(r);
    }

    public RestaurantDto findMine(String userLogin) {

        User user = userRepository.findByLogin(userLogin).orElseThrow(
                () -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Brak użytkownika"
                )
        );

        Restaurant r = restaurantRepository.findByUser(user).orElseThrow(
                () -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Brak restauracji"
                )
        );

        return toDto(r);
    }

    public RestaurantDto create(
            String ownerFirstName,
            String ownerLastName,
            String ownerEmail,
            String ownerPhone,
            String name,
            String description,
            Integer categoryId,
            String street,
            String houseNumber,
            String apartmentNumber,
            String postalCode,
            String city,
            MultipartFile image
    ) {

        if (userRepository.findByLogin(ownerEmail).isPresent()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Użytkownik z takim emailem już istnieje"
            );
        }

        String generatedPassword = generatePassword();

        User user = new User();

        user.setLogin(ownerEmail);

        user.setPassword(
                passwordEncoder.encode(generatedPassword)
        );

        user.setCreateAccountDate(
                LocalDateTime.now()
        );

        AccountStatus activeStatus =
                accountStatusRepository.findById(1)
                        .orElseThrow();

        UserRole ownerRole =
                userRoleRepository.findById(2)
                        .orElseThrow();

        user.setAccountStatus(activeStatus);

        user.setRoles(
                List.of(ownerRole)
        );

        user = userRepository.save(user);

        RestaurantCategory category = categoryRepository.findById(categoryId).orElseThrow(
                () -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Nieznana kategoria"
                )
        );

        Restaurant r = new Restaurant();

        r.setUser(user);
        r.setCategory(category);

        r.setRestaurantName(name);
        r.setDescription(description);

        r.setStreet(street);
        r.setHouseNumber(houseNumber);

        r.setApartmentNumber(
                emptyToNull(apartmentNumber)
        );

        r.setPostalCode(postalCode);
        r.setCity(city);

        r.setImagePath(
                image != null && !image.isEmpty()
                        ? fileStorageService.store(image)
                        : ""
        );

        r.setIsApproved(0);

        restaurantRepository.save(r);

        RestaurantDto dto = toDto(r);
        dto.setGeneratedPassword(generatedPassword);
        return dto;
    }

    public RestaurantDto update(
            Integer id,
            String userLogin,
            String name,
            String description,
            Integer categoryId,
            String street,
            String houseNumber,
            String apartmentNumber,
            String postalCode,
            String city,
            MultipartFile image
    ) {

        Restaurant r = restaurantRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Restauracja nie istnieje"
                )
        );

        if (r.getUser() == null
                || !r.getUser().getLogin().equals(userLogin)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Brak uprawnień"
            );
        }

        if (categoryId != null) {

            RestaurantCategory category = categoryRepository.findById(categoryId).orElseThrow(
                    () -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Nieznana kategoria"
                    )
            );

            r.setCategory(category);
        }

        if (name != null) {
            r.setRestaurantName(name);
        }

        if (description != null) {
            r.setDescription(description);
        }

        if (street != null) {
            r.setStreet(street);
        }

        if (houseNumber != null) {
            r.setHouseNumber(houseNumber);
        }

        r.setApartmentNumber(
                emptyToNull(apartmentNumber)
        );

        if (postalCode != null) {
            r.setPostalCode(postalCode);
        }

        if (city != null) {
            r.setCity(city);
        }

        if (image != null && !image.isEmpty()) {
            r.setImagePath(
                    fileStorageService.store(image)
            );
        }

        return toDto(
                restaurantRepository.save(r)
        );
    }

    public List<CategoryDto> listCategories() {

        return categoryRepository.findAll().stream()
                .map(c -> new CategoryDto(
                        c.getId(),
                        c.getCategoryName()
                ))
                .collect(Collectors.toList());
    }

    private String emptyToNull(String s) {

        return s == null || s.isBlank()
                ? null
                : s;
    }

    private String generatePassword() {

        String chars =
                "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 10; i++) {

            int index = (int) (
                    Math.random() * chars.length()
            );

            sb.append(chars.charAt(index));
        }

        return sb.toString();
    }

    private RestaurantDto toDto(Restaurant r) {

        return new RestaurantDto(
                r.getId(),
                r.getCategory() != null
                        ? r.getCategory().getId()
                        : null,
                r.getUser() != null
                        ? r.getUser().getId()
                        : null,
                r.getRestaurantName(),
                r.getDescription(),
                r.getStreet(),
                r.getHouseNumber(),
                r.getApartmentNumber(),
                r.getPostalCode(),
                r.getCity(),
                r.getImagePath(),
                r.getIsApproved(),
                null
        );
    }
}