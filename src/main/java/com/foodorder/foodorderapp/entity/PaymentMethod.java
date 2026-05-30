package com.foodorder.foodorderapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "payment_methods")
@Getter
@Setter
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_payment_method")
    private Integer id;

    @Column(name = "method_name")
    private String methodName;

    @Column(name = "method_description")
    private String methodDescription;
}
