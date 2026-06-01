package com.foodorder.foodorderapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AdminRestaurantDetailDto {

    // Dane restauracji
    @JsonProperty("id_restaurant")
    private Integer idRestaurant;

    @JsonProperty("restaurant_name")
    private String restaurantName;

    private String description;
    private String street;

    @JsonProperty("house_number")
    private String houseNumber;

    @JsonProperty("postal_code")
    private String postalCode;

    private String city;

    @JsonProperty("image_path")
    private String imagePath;

    @JsonProperty("is_approved")
    private Integer isApproved;

    @JsonProperty("category_name")
    private String categoryName;

    // Dane właściciela
    @JsonProperty("owner_login")
    private String ownerLogin;

    @JsonProperty("owner_name")
    private String ownerName;

    @JsonProperty("owner_surname")
    private String ownerSurname;

    // Menu restauracji
    private List<MenuProductDto> menu;
}
