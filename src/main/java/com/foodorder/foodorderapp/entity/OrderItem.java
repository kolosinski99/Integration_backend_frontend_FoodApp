package com.foodorder.foodorderapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
public class OrderItem {

    @EmbeddedId
    private OrderItemId id;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("orderId")
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("menuProductId")
    @JoinColumn(name = "menu_product_id")
    private MenuProduct menuProduct;

    @Column(name = "item_quantity")
    private Integer itemQuantity;

    @Column(name = "item_price")
    private BigDecimal itemPrice;
}
