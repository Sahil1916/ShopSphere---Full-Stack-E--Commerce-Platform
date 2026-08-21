package com.shop.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "cart", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
public class Cart {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id") private Long userId;
    @Column(name = "product_id") private Long productId;
    private int quantity;
}
