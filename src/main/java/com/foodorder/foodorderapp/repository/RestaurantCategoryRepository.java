package com.foodorder.foodorderapp.repository;

import com.foodorder.foodorderapp.entity.RestaurantCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantCategoryRepository extends JpaRepository<RestaurantCategory, Integer> {
}
