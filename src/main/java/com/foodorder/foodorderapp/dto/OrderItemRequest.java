package com.foodorder.foodorderapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemRequest {

    @JsonProperty("menu_product_id")
    private Integer menuProductId;

    private Integer quantity;
}
