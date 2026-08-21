package com.shop.repository;

import com.shop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Modifying
    @Query("""
        UPDATE Product p
        SET p.quantity = p.quantity - :qty
        WHERE p.id = :id
        AND p.quantity >= :qty
    """)
    int decrementStock(
            @Param("id") Long id,
            @Param("qty") Integer qty
    );

    @Modifying
    @Query("""
        UPDATE Product p
        SET p.quantity = p.quantity + :quantity
        WHERE p.id = :productId
    """)
    int restoreStock(
            @Param("productId") Long productId,
            @Param("quantity") Integer quantity
    );
}