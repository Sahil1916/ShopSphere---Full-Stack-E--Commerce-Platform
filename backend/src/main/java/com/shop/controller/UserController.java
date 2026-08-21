package com.shop.controller;

import com.shop.dto.LoginRequest;
import com.shop.dto.RegisterRequest;
import com.shop.dto.UserResponse;
import com.shop.model.User;
import com.shop.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        return userService.register(req)
            ? ResponseEntity.status(201).body("User Registered Successfully")
            : ResponseEntity.status(409).body("Email Already Exists");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpSession session) {
        User user = userService.login(req);
        if (user == null) return ResponseEntity.status(401).body("Invalid Email or Password");
        session.setAttribute("userId", user.getId());
        session.setAttribute("role",   user.getRole().name());
        session.setAttribute("name",   user.getName());
        session.setAttribute("email",  user.getEmail());
        // Return full UserResponse so frontend gets id, name, email, role, status
        return ResponseEntity.ok(userService.toResponse(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logout Successful");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).body("Please Login First");
        // Return same shape as login so frontend always gets {id, name, email, role}
        return userService.findById(userId)
            .map(u -> ResponseEntity.ok(userService.toResponse(u)))
            .orElse(ResponseEntity.status(401).build());
    }
}
