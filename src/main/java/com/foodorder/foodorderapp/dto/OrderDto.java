package com.foodorder.foodorderapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {

    @JsonProperty("id_order")
    private Integer idOrder;

    @JsonProperty("restaurant_id")
    private Integer restaurantId;

    @JsonProperty("restaurant_name")
    private String restaurantName;

    @JsonProperty("status_name")
    private String statusName;

    @JsonProperty("create_date")
    private LocalDateTime createDate;

    @JsonProperty("client_comment")
    private String clientComment;

    @JsonProperty("restaurant_comment")
    private String restaurantComment;

    @JsonProperty("total_price")
    private BigDecimal totalPrice;

    private List<OrderItemDto> items;

    @JsonProperty("estimated_minutes")
    private Integer estimatedMinutes;
}
