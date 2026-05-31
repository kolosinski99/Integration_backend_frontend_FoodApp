package com.foodorder.foodorderapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentMethodDto {

    private Integer id;

    @JsonProperty("method_name")
    private String methodName;

    @JsonProperty("method_description")
    private String methodDescription;
}
