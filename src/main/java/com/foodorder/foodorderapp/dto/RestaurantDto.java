package com.foodorder.foodorderapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDto {

    @JsonProperty("id_restaurant")
    private Integer idRestaurant;

    @JsonProperty("restaurant_category_id")
    private Integer restaurantCategoryId;

    @JsonProperty("user_id")
    private Integer userId;

    @JsonProperty("restaurant_name")
    private String restaurantName;

    private String description;

    private String street;

    @JsonProperty("house_number")
    private String houseNumber;

    @JsonProperty("apartment_number")
    private String apartmentNumber;

    @JsonProperty("postal_code")
    private String postalCode;

    private String city;

    @JsonProperty("image_path")
    private String imagePath;

    @JsonProperty("is_approved")
    private Integer isApproved;

    @JsonProperty("generated_password")
    private String generatedPassword;

    @JsonProperty("delivery_price")
    private BigDecimal deliveryPrice;

    @JsonProperty("free_delivery_from")
    private BigDecimal freeDeliveryFrom;

    @JsonProperty("min_order_amount")
    private BigDecimal minOrderAmount;

    @JsonProperty("open_from")
    private String openFrom;

    @JsonProperty("open_to")
    private String openTo;

    @JsonProperty("delivery_from")
    private String deliveryFrom;

    @JsonProperty("delivery_to")
    private String deliveryTo;

    @JsonProperty("pickup_available")
    private Integer pickupAvailable;
}
