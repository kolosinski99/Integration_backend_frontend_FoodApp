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
public class MenuProductDto {

    @JsonProperty("id_menu_product")
    private Integer idMenuProduct;

    @JsonProperty("category_id")
    private Integer categoryId;

    @JsonProperty("restaurant_id")
    private Integer restaurantId;

    @JsonProperty("product_name")
    private String productName;

    private BigDecimal price;

    @JsonProperty("product_description")
    private String productDescription;

    @JsonProperty("image_path")
    private String imagePath;

    @JsonProperty("spice_level")
    private Integer spiceLevel;

    private String allergens;
}
