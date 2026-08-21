package com.shop.controller;

import com.shop.model.InventoryTransaction;
import com.shop.model.Product;
import com.shop.service.InventoryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // ==========================================
    // CURRENT INVENTORY / PRODUCTS
    // ==========================================

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getInventoryProducts() {

        return ResponseEntity.ok(
                inventoryService.getInventoryProducts()
        );
    }

    // ==========================================
    // INVENTORY TRANSACTION HISTORY
    // ==========================================

    @GetMapping
    public ResponseEntity<List<InventoryTransaction>> getAll() {

        return ResponseEntity.ok(
                inventoryService.getAllTransactions()
        );
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<InventoryTransaction>> getProductHistory(
            @PathVariable Long productId
    ) {

        return ResponseEntity.ok(
                inventoryService.getProductHistory(productId)
        );
    }

    // ==========================================
    // STOCK IN
    // ==========================================

    @PostMapping("/stock-in")
    public ResponseEntity<?> stockIn(
            @RequestBody StockRequest request
    ) {

        return ResponseEntity.ok(
                inventoryService.addStock(
                        request.getProductId(),
                        request.getQuantity(),
                        request.getReason()
                )
        );
    }

    // ==========================================
    // STOCK OUT
    // ==========================================

    @PostMapping("/stock-out")
    public ResponseEntity<?> stockOut(
            @RequestBody StockRequest request
    ) {

        return ResponseEntity.ok(
                inventoryService.removeStock(
                        request.getProductId(),
                        request.getQuantity(),
                        request.getReason()
                )
        );
    }

    // ==========================================
    // RETURN
    // ==========================================

    @PostMapping("/return")
    public ResponseEntity<?> returnStock(
            @RequestBody StockRequest request
    ) {

        return ResponseEntity.ok(
                inventoryService.returnStock(
                        request.getProductId(),
                        request.getQuantity(),
                        request.getReason()
                )
        );
    }

    // ==========================================
    // ADJUST
    // ==========================================

    @PostMapping("/adjust")
    public ResponseEntity<?> adjust(
            @RequestBody AdjustRequest request
    ) {

        return ResponseEntity.ok(
                inventoryService.adjustStock(
                        request.getProductId(),
                        request.getQuantity(),
                        request.getReason()
                )
        );
    }

    @Data
    public static class StockRequest {

        private Long productId;
        private Integer quantity;
        private String reason;
    }

    @Data
    public static class AdjustRequest {

        private Long productId;
        private Integer quantity;
        private String reason;
    }
}