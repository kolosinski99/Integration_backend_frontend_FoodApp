package com.foodorder.foodorderapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCreateRestaurantRequest {

    @JsonProperty("owner_email")
    private String ownerEmail;

    @JsonProperty("owner_first_name")
    private String ownerFirstName;

    @JsonProperty("owner_last_name")
    private String ownerLastName;

    @JsonProperty("restaurant_name")
    private String restaurantName;

    @JsonProperty("restaurant_category_id")
    private Integer restaurantCategoryId;

    private String street;

    @JsonProperty("house_number")
    private String houseNumber;

    @JsonProperty("apartment_number")
    private String apartmentNumber;

    @JsonProperty("postal_code")
    private String postalCode;

    private String city;

    private String description;
}
