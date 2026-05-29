package com.foodorder.foodorderapp.repository;

import com.foodorder.foodorderapp.entity.MenuProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuProductRepository extends JpaRepository<MenuProduct, Integer> {

    List<MenuProduct> findAllByRestaurant_Id(Integer restaurantId);
}
