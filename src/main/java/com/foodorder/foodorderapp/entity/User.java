package com.foodorder.foodorderapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_user")
    private Integer id;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private List<UserRole> roles;

    @ManyToOne(fetch = FetchType.EAGER)
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
