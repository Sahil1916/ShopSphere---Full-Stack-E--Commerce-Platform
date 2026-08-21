package com.shop.controller;

import com.shop.dto.PlaceOrderRequest;
import com.shop.service.OrderService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    private Long getUser(HttpSession session) { return (Long) session.getAttribute("userId"); }

    @PostMapping
    public ResponseEntity<?> place(@RequestBody PlaceOrderRequest req, HttpSession session) {
        Long userId = getUser(session);
        if (userId == null) return ResponseEntity.status(401).body("Please login first");
        return orderService.placeOrder(userId, req.getShippingAddress(), req.getPaymentMethod())
            ? ResponseEntity.ok("Order placed successfully")
            : ResponseEntity.badRequest().body("Cart is empty or stock unavailable");
    }

    @GetMapping
    public ResponseEntity<?> myOrders(HttpSession session) {
        Long userId = getUser(session);
        if (userId == null) return ResponseEntity.status(401).body("Please login first");
        return ResponseEntity.ok(orderService.getByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> orderDetails(@PathVariable Long id, HttpSession session) {
        Long userId = getUser(session);
        if (userId == null) return ResponseEntity.status(401).body("Please login first");
        return orderService.getOrderDetails(id, userId)
            .map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
