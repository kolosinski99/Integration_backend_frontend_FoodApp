package com.foodorder.foodorderapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {

    @JsonProperty("menu_product_id")
    private Integer menuProductId;

    @JsonProperty("product_name")
    private String productName;

    private Integer quantity;

    @JsonProperty("item_price")
    private BigDecimal itemPrice;
}
