package com.foodorder.foodorderapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class SalesReportDto {

    @JsonProperty("total_revenue")
    private BigDecimal totalRevenue;

    @JsonProperty("total_orders")
    private Integer totalOrders;

    @JsonProperty("top_products")
    private List<TopProductDto> topProducts;

    @Getter
    @AllArgsConstructor
    public static class TopProductDto {

        @JsonProperty("product_name")
        private String productName;

        @JsonProperty("quantity_sold")
        private Integer quantitySold;

        private BigDecimal revenue;
    }
}
