package com.foodorder.foodorderapp.repository;

import com.foodorder.foodorderapp.entity.Client;
import com.foodorder.foodorderapp.entity.Order;
import com.foodorder.foodorderapp.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByClient(Client client);

    List<Order> findByRestaurant(Restaurant restaurant);

    List<Order> findByRestaurantOrderByCreateDateDesc(Restaurant restaurant);

    List<Order> findByClientOrderByCreateDateDesc(Client client);
}
