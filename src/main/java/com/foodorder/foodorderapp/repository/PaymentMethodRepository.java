package com.foodorder.foodorderapp.repository;

import com.foodorder.foodorderapp.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Integer> {

    Optional<PaymentMethod> findByMethodName(String methodName);
}
