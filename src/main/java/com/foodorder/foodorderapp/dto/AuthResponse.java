package com.foodorder.foodorderapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String login;
    private String role;
    private String name;
    private String surname;
}
