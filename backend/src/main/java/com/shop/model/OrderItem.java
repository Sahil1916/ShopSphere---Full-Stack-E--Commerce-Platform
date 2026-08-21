package com.shop.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "order_id") private Long orderId;
    @Column(name = "product_id") private Long productId;
    private int quantity;
    private BigDecimal price;
}
