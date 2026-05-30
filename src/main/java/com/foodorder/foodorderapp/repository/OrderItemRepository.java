package com.foodorder.foodorderapp.repository;

import com.foodorder.foodorderapp.entity.OrderItem;
import com.foodorder.foodorderapp.entity.OrderItemId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, OrderItemId> {
}
