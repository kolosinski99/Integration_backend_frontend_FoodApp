package com.foodorder.foodorderapp.repository;

import com.foodorder.foodorderapp.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Integer> {
}