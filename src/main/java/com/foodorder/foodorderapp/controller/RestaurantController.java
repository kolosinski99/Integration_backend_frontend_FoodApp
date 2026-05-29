package com.foodorder.foodorderapp.controller;

import com.foodorder.foodorderapp.dto.CategoryDto;
import com.foodorder.foodorderapp.dto.RestaurantDto;
import com.foodorder.foodorderapp.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping("/api/restaurants")
    public List<RestaurantDto> list(Authentication auth) {

        return restaurantService.findAllForUser(
                auth != null ? auth.getName() : null
        );
    }

    @GetMapping("/api/restaurants/my")
    public RestaurantDto mine(Authentication auth) {

        return restaurantService.findMine(
                auth.getName()
        );
    }

    @GetMapping("/api/restaurants/{id}")
    public RestaurantDto byId(
            @PathVariable Integer id
    ) {

        return restaurantService.findById(id);
    }

    @PostMapping(
            value = "/api/restaurants",
            consumes = "multipart/form-data"
    )
    public RestaurantDto create(

            @RequestParam("owner_first_name")
            String ownerFirstName,

            @RequestParam("owner_last_name")
            String ownerLastName,

            @RequestParam("owner_email")
            String ownerEmail,

            @RequestParam("owner_phone")
            String ownerPhone,

            @RequestParam("restaurant_name")
            String name,

            @RequestParam(
                    value = "description",
                    required = false
            )
            String description,

            @RequestParam("restaurant_category_id")
            Integer categoryId,

            @RequestParam("street")
            String street,

            @RequestParam("house_number")
            String houseNumber,

            @RequestParam(
                    value = "apartment_number",
                    required = false
            )
            String apartmentNumber,

            @RequestParam("postal_code")
            String postalCode,

            @RequestParam("city")
            String city,

            @RequestParam(
                    value = "image",
                    required = false
            )
            MultipartFile image
    ) {

        return restaurantService.create(
                ownerFirstName,
                ownerLastName,
                ownerEmail,
                ownerPhone,
                name,
                description,
                categoryId,
                street,
                houseNumber,
                apartmentNumber,
                postalCode,
                city,
                image
        );
    }

    @PutMapping(
            value = "/api/restaurants/{id}",
            consumes = "multipart/form-data"
    )
    public RestaurantDto update(

            @PathVariable Integer id,

            Authentication auth,

            @RequestParam(
                    value = "restaurant_name",
                    required = false
            )
            String name,

            @RequestParam(
                    value = "description",
                    required = false
            )
            String description,

            @RequestParam(
                    value = "restaurant_category_id",
                    required = false
            )
            Integer categoryId,

            @RequestParam(
                    value = "street",
                    required = false
            )
            String street,

            @RequestParam(
                    value = "house_number",
                    required = false
            )
            String houseNumber,

            @RequestParam(
                    value = "apartment_number",
                    required = false
            )
            String apartmentNumber,

            @RequestParam(
                    value = "postal_code",
                    required = false
            )
            String postalCode,

            @RequestParam(
                    value = "city",
                    required = false
            )
            String city,

            @RequestParam(
                    value = "image",
                    required = false
            )
            MultipartFile image
    ) {

        return restaurantService.update(
                id,
                auth.getName(),
                name,
                description,
                categoryId,
                street,
                houseNumber,
                apartmentNumber,
                postalCode,
                city,
                image
        );
    }

    @GetMapping("/api/restaurant-categories")
    public List<CategoryDto> categories() {

        return restaurantService.listCategories();
    }
}