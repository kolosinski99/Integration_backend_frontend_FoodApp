package com.foodorder.foodorderapp.controller;

import com.foodorder.foodorderapp.dto.AdminRestaurantDetailDto;
import com.foodorder.foodorderapp.dto.OrderDto;
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

    @GetMapping("/api/admin/restaurants/{id}")
    public AdminRestaurantDetailDto restaurantDetail(@PathVariable Integer id) {
        return adminService.getRestaurantDetail(id);
    }

    @GetMapping("/api/admin/orders")
    public List<OrderDto> allOrders() {
        return adminService.getAllOrders();
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
