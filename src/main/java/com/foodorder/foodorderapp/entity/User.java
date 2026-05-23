package com.foodorder.foodorderapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_user")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_role_id")
    private UserRole role;

    @ManyToOne
    @JoinColumn(name = "account_status_id")
    private AccountStatus accountStatus;

    @Column(unique = true)
    private String login;

    private String password;

    @Column(name = "create_account_date")
    private LocalDateTime createAccountDate;

    @Column(name = "disable_account_date")
    private LocalDateTime disableAccountDate;
}