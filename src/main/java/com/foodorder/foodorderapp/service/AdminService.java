package com.foodorder.foodorderapp.service;

import com.foodorder.foodorderapp.dto.RestaurantDto;
import com.foodorder.foodorderapp.entity.Restaurant;
import com.foodorder.foodorderapp.repository.RestaurantRepository;
import com.foodorder.foodorderapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

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

    private RestaurantDto toDto(Restaurant r) {
        return new RestaurantDto(
                r.getId(),
                r.getCategory() != null ? r.getCategory().getId() : null,
                r.getUser() != null ? r.getUser().getId() : null,
                r.getRestaurantName(),
                r.getDescription(),
                r.getStreet(),
                r.getHouseNumber(),
                r.getApartmentNumber(),
                r.getPostalCode(),
                r.getCity(),
                r.getImagePath(),
                r.getIsApproved()
        );
    }
}
