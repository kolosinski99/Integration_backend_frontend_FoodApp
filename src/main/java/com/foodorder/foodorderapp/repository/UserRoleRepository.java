package com.foodorder.foodorderapp.repository;

import com.foodorder.foodorderapp.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, Integer> {
}