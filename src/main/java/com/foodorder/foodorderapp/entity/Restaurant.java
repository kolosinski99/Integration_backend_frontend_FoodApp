package com.foodorder.foodorderapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "restaurants")
@Getter
@Setter
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_restaurant")
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "restaurant_category_id")
    private RestaurantCategory category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "restaurant_name")
    private String restaurantName;

    @Column(name = "description", length = 500)
    private String description;

    private String street;

    @Column(name = "house_number")
    private String houseNumber;

    @Column(name = "apartment_number")
    private String apartmentNumber;

    @Column(name = "postal_code")
    private String postalCode;

    private String city;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "is_approved")
    private Integer isApproved;

    @Column(name = "delivery_price")
    private BigDecimal deliveryPrice;

    @Column(name = "free_delivery_from")
    private BigDecimal freeDeliveryFrom;

    @Column(name = "min_order_amount")
    private BigDecimal minOrderAmount;

    @Column(name = "open_from")
    private LocalTime openFrom;

    @Column(name = "open_to")
    private LocalTime openTo;

    @Column(name = "delivery_from")
    private LocalTime deliveryFrom;

    @Column(name = "delivery_to")
    private LocalTime deliveryTo;

    @Column(name = "pickup_available")
    private Integer pickupAvailable;
}
