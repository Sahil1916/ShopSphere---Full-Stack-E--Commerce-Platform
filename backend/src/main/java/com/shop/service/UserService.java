package com.shop.service;

import at.favre.lib.crypto.bcrypt.BCrypt;
import com.shop.dto.LoginRequest;
import com.shop.dto.RegisterRequest;
import com.shop.dto.UserResponse;
import com.shop.enums.UserRole;
import com.shop.model.User;
import com.shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    public boolean register(RegisterRequest req) {
        if (!StringUtils.hasText(req.getEmail()) || !StringUtils.hasText(req.getPassword())) return false;
        if (userRepository.existsByEmail(req.getEmail().trim().toLowerCase())) return false;
        User user = new User();
        user.setName(req.getName().trim());
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setPassword(BCrypt.withDefaults().hashToString(12, req.getPassword().toCharArray()));
        user.setRole(UserRole.CUSTOMER);
        userRepository.save(user);
        // Send welcome email after registration
        emailService.sendWelcomeMail(user.getName(), user.getEmail());
        return true;
    }

//    public User login(LoginRequest req) {
//        if (!StringUtils.hasText(req.getEmail()) || !StringUtils.hasText(req.getPassword())) return null;
//        return userRepository.findByEmail(req.getEmail().trim().toLowerCase())
//            .filter(u -> StringUtils.hasText(u.getPassword()))
//            .filter(u -> "ACTIVE".equalsIgnoreCase(u.getStatus()))
//            .filter(u -> BCrypt.verifyer().verify(req.getPassword().toCharArray(), u.getPassword()).verified)
//            .orElse(null);
//    }

    public User login(LoginRequest req) {

        System.out.println("LOGIN EMAIL = " + req.getEmail());
        System.out.println("PASSWORD RECEIVED = " + req.getPassword());

        if (!StringUtils.hasText(req.getEmail()) ||
                !StringUtils.hasText(req.getPassword())) {
            System.out.println("EMAIL OR PASSWORD EMPTY");
            return null;
        }

        Optional<User> optionalUser =
                userRepository.findByEmail(
                        req.getEmail().trim().toLowerCase()
                );

        if (optionalUser.isEmpty()) {
            System.out.println("USER NOT FOUND");
            return null;
        }

        User user = optionalUser.get();

        System.out.println("USER FOUND = " + user.getEmail());
        System.out.println("ROLE = " + user.getRole());
        System.out.println("STATUS = " + user.getStatus());
        System.out.println("HASH = " + user.getPassword());

        if (!StringUtils.hasText(user.getPassword())) {
            System.out.println("PASSWORD HASH IS EMPTY");
            return null;
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            System.out.println("USER IS BLOCKED/INACTIVE");
            return null;
        }

        boolean passwordMatches =
                BCrypt.verifyer()
                        .verify(
                                req.getPassword().toCharArray(),
                                user.getPassword()
                        )
                        .verified;

        System.out.println("PASSWORD MATCH = " + passwordMatches);

        if (!passwordMatches) {
            System.out.println("PASSWORD DOES NOT MATCH");
            return null;
        }

        System.out.println("LOGIN SUCCESS");

        return user;
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public List<UserResponse> listAll() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public boolean updateStatus(Long id, String status) {
        return userRepository.findById(id).map(u -> {
            u.setStatus(status);
            userRepository.save(u);
            return true;
        }).orElse(false);
    }

    public UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getStatus());
    }
}
