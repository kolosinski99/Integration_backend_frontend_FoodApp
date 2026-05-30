package com.foodorder.foodorderapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NewAddressDto {

    private String street;

    @JsonProperty("house_number")
    private String houseNumber;

    @JsonProperty("apartment_number")
    private String apartmentNumber;

    @JsonProperty("postal_code")
    private String postalCode;

    private String city;

    private Double lat;

    private Double lon;
}
