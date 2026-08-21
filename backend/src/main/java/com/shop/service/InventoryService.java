package com.shop.service;

import com.shop.enums.InventoryTransactionType;
import com.shop.model.InventoryTransaction;
import com.shop.model.Product;
import com.shop.repository.InventoryTransactionRepository;
import com.shop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final InventoryTransactionRepository inventoryRepository;

    // Add stock
    @Transactional
    public InventoryTransaction addStock(
            Long productId,
            Integer quantity,
            String reason
    ) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Stock quantity must be greater than 0"
            );
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        int previous = product.getQuantity() == null
                ? 0
                : product.getQuantity();

        int updated = previous + quantity;

        product.setQuantity(updated);
        productRepository.save(product);

        return createTransaction(
                productId,
                InventoryTransactionType.STOCK_IN,
                quantity,
                previous,
                updated,
                reason
        );
    }

    // Remove stock
    @Transactional
    public InventoryTransaction removeStock(
            Long productId,
            Integer quantity,
            String reason
    ) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than 0"
            );
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        int previous = product.getQuantity() == null
                ? 0
                : product.getQuantity();

        if (previous < quantity) {
            throw new RuntimeException(
                    "Insufficient stock. Available: " + previous
            );
        }

        int updated = previous - quantity;

        product.setQuantity(updated);
        productRepository.save(product);

        return createTransaction(
                productId,
                InventoryTransactionType.SALE,
                quantity,
                previous,
                updated,
                reason
        );
    }

    // Return stock
    @Transactional
    public InventoryTransaction returnStock(
            Long productId,
            Integer quantity,
            String reason
    ) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than 0"
            );
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        int previous = product.getQuantity() == null
                ? 0
                : product.getQuantity();

        int updated = previous + quantity;

        product.setQuantity(updated);
        productRepository.save(product);

        return createTransaction(
                productId,
                InventoryTransactionType.RETURN,
                quantity,
                previous,
                updated,
                reason
        );
    }

    // Manual adjustment
    @Transactional
    public InventoryTransaction adjustStock(
            Long productId,
            Integer newQuantity,
            String reason
    ) {

        if (newQuantity == null || newQuantity < 0) {
            throw new IllegalArgumentException(
                    "Stock cannot be negative"
            );
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        int previous = product.getQuantity() == null
                ? 0
                : product.getQuantity();

        int difference = newQuantity - previous;

        product.setQuantity(newQuantity);
        productRepository.save(product);

        return createTransaction(
                productId,
                InventoryTransactionType.ADJUSTMENT,
                Math.abs(difference),
                previous,
                newQuantity,
                reason
        );
    }

    public List<InventoryTransaction> getAllTransactions() {

        return inventoryRepository
                .findAllByOrderByCreatedAtDesc();
    }

    public List<InventoryTransaction> getProductHistory(Long productId) {

        return inventoryRepository
                .findByProductIdOrderByCreatedAtDesc(productId);
    }

    private InventoryTransaction createTransaction(
            Long productId,
            InventoryTransactionType type,
            Integer quantity,
            Integer previous,
            Integer updated,
            String reason
    ) {

        InventoryTransaction transaction =
                new InventoryTransaction();

        transaction.setProductId(productId);
        transaction.setType(type);
        transaction.setQuantity(quantity);
        transaction.setPreviousQuantity(previous);
        transaction.setNewQuantity(updated);
        transaction.setReason(reason);

        return inventoryRepository.save(transaction);
    }

    @Transactional
    public InventoryTransaction sellStock(
            Long productId,
            Integer quantity,
            String reason
    ) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than 0"
            );
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        int previous = product.getQuantity() == null
                ? 0
                : product.getQuantity();

        if (previous < quantity) {
            throw new RuntimeException(
                    "Insufficient stock for product: "
                            + product.getName()
                            + ". Available: "
                            + previous
            );
        }

        int updated = previous - quantity;

        product.setQuantity(updated);

        productRepository.save(product);

        return createTransaction(
                productId,
                InventoryTransactionType.SALE,
                quantity,
                previous,
                updated,
                reason
        );
    }

    @Transactional
    public InventoryTransaction restoreStock(
            Long productId,
            Integer quantity,
            InventoryTransactionType type,
            String reason
    ) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than 0"
            );
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        int previous = product.getQuantity() == null
                ? 0
                : product.getQuantity();

        int updated = previous + quantity;

        product.setQuantity(updated);

        productRepository.save(product);

        return createTransaction(
                productId,
                type,
                quantity,
                previous,
                updated,
                reason
        );
    }

    public List<Product> getInventoryProducts() {
        return productRepository.findAll();
    }

}