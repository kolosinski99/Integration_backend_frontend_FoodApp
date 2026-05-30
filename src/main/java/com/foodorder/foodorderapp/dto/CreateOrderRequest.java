package com.foodorder.foodorderapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateOrderRequest {

    @JsonProperty("restaurant_id")
    private Integer restaurantId;

    @JsonProperty("address_id")
    private Integer addressId;

    @JsonProperty("payment_method_id")
    private Integer paymentMethodId;

    private List<OrderItemRequest> items;

    @JsonProperty("client_comment")
    private String clientComment;
}
