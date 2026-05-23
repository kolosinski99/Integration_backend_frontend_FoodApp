package com.foodorder.foodorderapp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    private String login;
    private String password;

    private String name;
    private String surname;

    private String street;
    private String houseNumber;
    private String apartmentNumber;
    private String postalCode;
    private String city;

    private String role;
}