package com.foodorder.foodorderapp.controller;

import com.foodorder.foodorderapp.dto.RestaurantDto;
import com.foodorder.foodorderapp.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/api/admin/restaurants")
    public List<RestaurantDto> allRestaurants() {
        return adminService.getAllRestaurants();
    }

    @PatchMapping("/api/admin/restaurants/{id}/approve")
    public RestaurantDto approve(@PathVariable Integer id) {
        return adminService.approveRestaurant(id);
    }

    @PatchMapping("/api/admin/restaurants/{id}/reject")
    public RestaurantDto reject(@PathVariable Integer id) {
        return adminService.rejectRestaurant(id);
    }
}
