package com.shop.model;

import com.shop.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id") private Long userId;
    @Column(name = "total_amount") private BigDecimal totalAmount;
    @Enumerated(EnumType.STRING) private OrderStatus status = OrderStatus.PENDING;
    @CreationTimestamp @Column(name = "order_date") private LocalDateTime orderDate;
    @Column(name = "shipping_address") private String shippingAddress;
    @Column(name = "payment_method") private String paymentMethod;
}
