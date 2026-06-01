package com.foodorder.foodorderapp.service;

import com.foodorder.foodorderapp.dto.AdminRestaurantDetailDto;
import com.foodorder.foodorderapp.dto.MenuProductDto;
import com.foodorder.foodorderapp.dto.RestaurantDto;
import com.foodorder.foodorderapp.entity.Client;
import com.foodorder.foodorderapp.entity.MenuProduct;
import com.foodorder.foodorderapp.entity.Restaurant;
import com.foodorder.foodorderapp.entity.User;
import com.foodorder.foodorderapp.repository.ClientRepository;
import com.foodorder.foodorderapp.repository.MenuProductRepository;
import com.foodorder.foodorderapp.repository.RestaurantRepository;
import com.foodorder.foodorderapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final MenuProductRepository menuProductRepository;

    public AdminRestaurantDetailDto getRestaurantDetail(Integer id) {
        Restaurant r = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Restauracja nie istnieje"));

        User owner = r.getUser();
        String ownerLogin = owner != null ? owner.getLogin() : "";

        // Pobierz dane klienta (imię, nazwisko) jeśli istnieje
        String ownerName = "";
        String ownerSurname = "";
        if (owner != null) {
            Optional<Client> clientOpt = clientRepository.findByUser(owner);
            if (clientOpt.isPresent()) {
                ownerName = clientOpt.get().getName();
                ownerSurname = clientOpt.get().getSurname();
            }
        }

        // Pobierz menu restauracji
        List<MenuProduct> products = menuProductRepository.findAllByRestaurant_Id(id);
        List<MenuProductDto> menuDtos = products.stream()
                .map(p -> new MenuProductDto(
                        p.getId(),
                        p.getCategory() != null ? p.getCategory().getId() : null,
                        r.getId(),
                        p.getProductName(),
                        p.getPrice(),
                        p.getProductDescription(),
                        p.getImagePath(),
                        p.getSpiceLevel(),
                        p.getAllergens()
                ))
                .toList();

        return new AdminRestaurantDetailDto(
                r.getId(),
                r.getRestaurantName(),
                r.getDescription(),
                r.getStreet(),
                r.getHouseNumber(),
                r.getPostalCode(),
                r.getCity(),
                r.getImagePath(),
                r.getIsApproved(),
                r.getCategory() != null ? r.getCategory().getCategoryName() : "",
                ownerLogin,
                ownerName,
                ownerSurname,
                menuDtos
        );
    }

    public List<RestaurantDto> getAllRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public RestaurantDto approveRestaurant(Integer id) {
        Restaurant r = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Restauracja nie istnieje"));
        r.setIsApproved(1);
        return toDto(restaurantRepository.save(r));
    }

    public RestaurantDto rejectRestaurant(Integer id) {
        Restaurant r = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Restauracja nie istnieje"));
        r.setIsApproved(0);
        return toDto(restaurantRepository.save(r));
    }

    private String timeToString(java.time.LocalTime t) {
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
