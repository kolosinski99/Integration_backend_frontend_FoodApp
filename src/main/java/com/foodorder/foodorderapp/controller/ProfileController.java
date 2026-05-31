package com.foodorder.foodorderapp.controller;

import com.foodorder.foodorderapp.dto.ProfileDto;
import com.foodorder.foodorderapp.dto.UpdateProfileRequest;
import com.foodorder.foodorderapp.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/api/clients/me")
    public ProfileDto getProfile(Authentication auth) {
        return profileService.getProfile(auth.getName());
    }

    @PutMapping("/api/clients/me")
    public ProfileDto updateProfile(
            Authentication auth,
            @RequestBody UpdateProfileRequest request) {
        return profileService.updateProfile(auth.getName(), request);
    }
}
