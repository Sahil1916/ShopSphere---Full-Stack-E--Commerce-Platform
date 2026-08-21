package com.shop.controller;

import com.shop.model.Product;
import com.shop.service.ProductService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<Product> getAll() {
        return productService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return productService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Product product, HttpSession session) {
        ResponseEntity<?> denied = requireAdmin(session);
        if (denied != null) return denied;
        return ResponseEntity.status(201).body(productService.save(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody Product product,
                                    HttpSession session) {
        ResponseEntity<?> denied = requireAdmin(session);
        if (denied != null) return denied;
        return productService.update(id, product)
                ? ResponseEntity.ok("Updated")
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpSession session) {
        ResponseEntity<?> denied = requireAdmin(session);
        if (denied != null) return denied;
        return productService.delete(id)
                ? ResponseEntity.ok("Deleted")
                : ResponseEntity.notFound().build();
    }

    private ResponseEntity<?> requireAdmin(HttpSession session) {
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(401).body("Please login first");
        }
        if (!"ADMIN".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(403).body("Access denied");
        }
        return null;
    }
}
