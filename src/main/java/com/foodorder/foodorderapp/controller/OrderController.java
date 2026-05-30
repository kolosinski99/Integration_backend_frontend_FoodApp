package com.foodorder.foodorderapp.controller;

import com.foodorder.foodorderapp.dto.CreateOrderRequest;
import com.foodorder.foodorderapp.dto.OrderDto;
import com.foodorder.foodorderapp.dto.UpdateOrderStatusRequest;
import com.foodorder.foodorderapp.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/api/orders")
    public OrderDto create(
            @RequestBody CreateOrderRequest request,
            Authentication auth) {
        return orderService.createOrder(auth.getName(), request);
    }

    @GetMapping("/api/orders/my")
    public List<OrderDto> myOrders(Authentication auth) {
        return orderService.getMyOrders(auth.getName());
    }

    @GetMapping("/api/orders/restaurant")
    public List<OrderDto> restaurantOrders(Authentication auth) {
        return orderService.getRestaurantOrders(auth.getName());
    }

    @PatchMapping("/api/orders/{id}/status")
    public OrderDto updateStatus(
            @PathVariable Integer id,
            @RequestBody UpdateOrderStatusRequest request,
            Authentication auth) {
        return orderService.updateStatus(
                id, request.getStatusName(), auth.getName());
    }
}
