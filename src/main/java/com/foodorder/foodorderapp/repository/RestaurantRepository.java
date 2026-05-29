package com.foodorder.foodorderapp.repository;

import com.foodorder.foodorderapp.entity.Restaurant;
import com.foodorder.foodorderapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Integer> {

    Optional<Restaurant> findByUser(User user);

    List<Restaurant> findAllByIsApproved(Integer isApproved);
}
