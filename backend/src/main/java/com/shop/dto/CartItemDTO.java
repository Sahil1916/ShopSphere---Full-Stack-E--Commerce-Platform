package com.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class CartItemDTO {
    private Long cartId;
    private Long productId;
    private String productName;
    private BigDecimal price;
    private String imageUrl;
    private int quantity;
}
