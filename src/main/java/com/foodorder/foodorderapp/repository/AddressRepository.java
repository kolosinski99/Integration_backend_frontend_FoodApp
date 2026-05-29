package com.foodorder.foodorderapp.repository;

import com.foodorder.foodorderapp.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Integer> {
}
