package com.shop.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.shop.enums.UserRole;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true) private String email;
    @JsonIgnore private String password;
    @Enumerated(EnumType.STRING) private UserRole role = UserRole.CUSTOMER;
    @Column(name = "status") private String status = "ACTIVE";
    @CreationTimestamp @Column(name = "created_at") private LocalDateTime createdAt;
}
