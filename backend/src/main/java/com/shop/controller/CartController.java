package com.shop.controller;

import com.shop.dto.CartItemDTO;
import com.shop.model.Cart;
import com.shop.service.CartService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    private Long getUser(HttpSession session) { return (Long) session.getAttribute("userId"); }

    @GetMapping
    public ResponseEntity<?> getCart(HttpSession session) {
        Long userId = getUser(session);
        if (userId == null) return ResponseEntity.status(401).body("Please login first");
        return ResponseEntity.ok(cartService.getByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> body, HttpSession session) {
        Long userId = getUser(session);
        if (userId == null) return ResponseEntity.status(401).body("Please login first");
        Long productId = Long.valueOf(body.get("productId").toString());
        int quantity = body.containsKey("quantity") ? Integer.parseInt(body.get("quantity").toString()) : 1;
        cartService.addOrUpdate(userId, productId, quantity);
        return ResponseEntity.status(201).body("Product added to cart");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuantity(@PathVariable Long id, @RequestBody Map<String, Integer> body, HttpSession session) {
        Long userId = getUser(session);
        if (userId == null) return ResponseEntity.status(401).body("Please login first");
        return cartService.updateQuantity(id, userId, body.get("quantity"))
            ? ResponseEntity.ok("Updated") : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id, HttpSession session) {
        Long userId = getUser(session);
        if (userId == null) return ResponseEntity.status(401).body("Please login first");
        return cartService.deleteItem(id, userId)
            ? ResponseEntity.ok("Deleted") : ResponseEntity.notFound().build();
    }
}
