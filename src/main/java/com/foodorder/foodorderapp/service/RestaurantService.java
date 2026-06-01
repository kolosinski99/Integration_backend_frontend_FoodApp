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
import com.foodorder.foodorderapp.entity.Client;
import com.foodorder.foodorderapp.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private final ClientRepository clientRepository;

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

        Client ownerClient = new Client();
        ownerClient.setUser(user);
        ownerClient.setName(ownerFirstName != null ? ownerFirstName.trim() : "");
        ownerClient.setSurname(ownerLastName != null ? ownerLastName.trim() : "");
        ownerClient.setAddresses(new java.util.ArrayList<>());
        clientRepository.save(ownerClient);

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
            MultipartFile image,
            BigDecimal deliveryPrice,
            BigDecimal freeDeliveryFrom,
            BigDecimal minOrderAmount,
            String openFrom,
            String openTo,
            String deliveryFrom,
            String deliveryTo,
            Integer pickupAvailable
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

        if (deliveryPrice != null) {
            r.setDeliveryPrice(deliveryPrice);
        }
        if (freeDeliveryFrom != null) {
            r.setFreeDeliveryFrom(freeDeliveryFrom);
        }
        if (minOrderAmount != null) {
            r.setMinOrderAmount(minOrderAmount);
        }
        if (openFrom != null) {
            r.setOpenFrom(LocalTime.parse(openFrom));
        }
        if (openTo != null) {
            r.setOpenTo(LocalTime.parse(openTo));
        }
        if (deliveryFrom != null) {
            r.setDeliveryFrom(LocalTime.parse(deliveryFrom));
        }
        if (deliveryTo != null) {
            r.setDeliveryTo(LocalTime.parse(deliveryTo));
        }
        if (pickupAvailable != null) {
            r.setPickupAvailable(pickupAvailable);
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

    private String timeToString(LocalTime t) {
        return t != null ? t.toString() : null;
    }

    private RestaurantDto toDto(Restaurant r) {
        RestaurantDto dto = new RestaurantDto();
        dto.setIdRestaurant(r.getId());
        dto.setRestaurantCategoryId(r.getCategory() != null ? r.getCategory().getId() : null);
        dto.setUserId(r.getUser() != null ? r.getUser().getId() : null);
        dto.setRestaurantName(r.getRestaurantName());
        dto.setDescription(r.getDescription());
        dto.setStreet(r.getStreet());
        dto.setHouseNumber(r.getHouseNumber());
        dto.setApartmentNumber(r.getApartmentNumber());
        dto.setPostalCode(r.getPostalCode());
        dto.setCity(r.getCity());
        dto.setImagePath(r.getImagePath());
        dto.setIsApproved(r.getIsApproved());
        dto.setDeliveryPrice(r.getDeliveryPrice());
        dto.setFreeDeliveryFrom(r.getFreeDeliveryFrom());
        dto.setMinOrderAmount(r.getMinOrderAmount());
        dto.setOpenFrom(timeToString(r.getOpenFrom()));
        dto.setOpenTo(timeToString(r.getOpenTo()));
        dto.setDeliveryFrom(timeToString(r.getDeliveryFrom()));
        dto.setDeliveryTo(timeToString(r.getDeliveryTo()));
        dto.setPickupAvailable(r.getPickupAvailable());
        return dto;
    }
}