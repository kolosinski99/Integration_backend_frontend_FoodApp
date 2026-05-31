package com.foodorder.foodorderapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {

    private String name;
    private String surname;
    private String street;

    @JsonProperty("house_number")
    private String houseNumber;

    @JsonProperty("apartment_number")
    private String apartmentNumber;

    @JsonProperty("postal_code")
    private String postalCode;

    private String city;
}
