package com.foodorder.foodorderapp.controller;

import com.foodorder.foodorderapp.dto.CategoryDto;
import com.foodorder.foodorderapp.dto.MenuProductDto;
import com.foodorder.foodorderapp.service.MenuProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class MenuProductController {

    private final MenuProductService menuProductService;

    @GetMapping("/api/restaurants/{restaurantId}/menu")
    public List<MenuProductDto> byRestaurant(@PathVariable Integer restaurantId) {
        return menuProductService.findByRestaurant(restaurantId);
    }

    @GetMapping("/api/menu-products/{id}")
    public MenuProductDto byId(@PathVariable Integer id) {
        return menuProductService.findById(id);
    }

    @PostMapping(value = "/api/menu-products", consumes = "multipart/form-data")
    public MenuProductDto create(
            Authentication auth,
            @RequestParam(value = "restaurant_id", required = false) Integer restaurantId,
            @RequestParam("category_id") Integer categoryId,
            @RequestParam("product_name") String name,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "product_description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        return menuProductService.create(auth.getName(), restaurantId, categoryId, name, price, description, image);
    }

    @PutMapping(value = "/api/menu-products/{id}", consumes = "multipart/form-data")
    public MenuProductDto update(
            @PathVariable Integer id,
            Authentication auth,
            @RequestParam(value = "category_id", required = false) Integer categoryId,
            @RequestParam(value = "product_name", required = false) String name,
            @RequestParam(value = "price", required = false) BigDecimal price,
            @RequestParam(value = "product_description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        return menuProductService.update(id, auth.getName(), categoryId, name, price, description, image);
    }

    @DeleteMapping("/api/menu-products/{id}")
    public void delete(@PathVariable Integer id, Authentication auth) {
        menuProductService.delete(id, auth.getName());
    }

    @GetMapping("/api/menu-product-categories")
    public List<CategoryDto> categories() {
        return menuProductService.listCategories();
    }
}
