package com.foodorder.foodorderapp.repository;

import com.foodorder.foodorderapp.entity.Client;
import com.foodorder.foodorderapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Integer> {

    Optional<Client> findByUser(User user);
}
