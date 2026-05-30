package com.foodorder.foodorderapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "orders_statuses")
@Getter
@Setter
public class OrderStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_order_status")
    private Integer id;

    @Column(name = "status_name")
    private String statusName;

    @Column(name = "status_description")
    private String statusDescription;
}
