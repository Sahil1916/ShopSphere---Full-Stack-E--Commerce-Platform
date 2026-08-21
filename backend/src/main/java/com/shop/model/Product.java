package com.shop.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(columnDefinition = "TEXT") private String description;
    private String category;
    private BigDecimal price;
    private BigDecimal mrp;
    private Integer quantity;
    @Column(name = "image_url") private String imageUrl;
    @CreationTimestamp @Column(name = "created_at") private LocalDateTime createdAt;
}
