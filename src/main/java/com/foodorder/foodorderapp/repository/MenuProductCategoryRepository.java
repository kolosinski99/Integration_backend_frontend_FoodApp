package com.foodorder.foodorderapp.repository;

import com.foodorder.foodorderapp.entity.MenuProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuProductCategoryRepository extends JpaRepository<MenuProductCategory, Integer> {
}
