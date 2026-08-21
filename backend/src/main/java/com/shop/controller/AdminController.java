package com.shop.controller;

import com.shop.enums.OrderStatus;
import com.shop.service.OrderService;
import com.shop.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final OrderService orderService;

    /** Returns 403 if the session user is not ADMIN, null otherwise. */
    private ResponseEntity<?> requireAdmin(HttpSession session) {
        if (session == null) return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body("Please login first");
        Object role = session.getAttribute("role");
        if (!"ADMIN".equals(role)) return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body("Access denied");
        return null;
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers(HttpSession session) {
        ResponseEntity<?> denied = requireAdmin(session);
        if (denied != null) return denied;
        return ResponseEntity.ok(userService.listAll());
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id,
                                              @RequestBody Map<String, String> body,
                                              HttpSession session) {
        ResponseEntity<?> denied = requireAdmin(session);
        if (denied != null) return denied;
        return userService.updateStatus(id, body.get("status"))
            ? ResponseEntity.ok("Updated")
            : ResponseEntity.notFound().build();
    }

    @GetMapping("/orders")
    public ResponseEntity<?> listOrders(HttpSession session) {
        ResponseEntity<?> denied = requireAdmin(session);
        if (denied != null) return denied;
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id,
                                               @RequestBody Map<String, String> body,
                                               HttpSession session) {
        ResponseEntity<?> denied = requireAdmin(session);
        if (denied != null) return denied;
        try {
            OrderStatus status = OrderStatus.valueOf(body.get("status"));
            return orderService.updateStatus(id, status)
                ? ResponseEntity.ok("Updated")
                : ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status value");
        }
    }
}
