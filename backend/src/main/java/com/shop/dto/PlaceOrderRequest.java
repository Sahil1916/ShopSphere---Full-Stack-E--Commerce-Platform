package com.shop.dto;
import lombok.Data;

@Data
public class PlaceOrderRequest {
    private String shippingAddress;
    private String paymentMethod;
}
