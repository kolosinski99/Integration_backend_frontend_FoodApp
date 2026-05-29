package com.foodorder.foodorderapp.repository;

import com.foodorder.foodorderapp.entity.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountStatusRepository
        extends JpaRepository<AccountStatus, Integer> {
}