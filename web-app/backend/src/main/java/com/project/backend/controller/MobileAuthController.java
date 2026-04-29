package com.project.backend.controller;

import com.project.backend.entity.User;
import com.project.backend.repository.UserRepository;
import com.project.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Authentication controller for the Mobile App (Student-facing).
 * Separate from admin AuthController.
 * 
 * Public endpoints:
 *   POST /api/mobile/auth/register  - Student registration
 *   POST /api/mobile/auth/login     - Student login
 * 
 * Protected endpoint:
 *   GET  /api/mobile/auth/validate  - Validate existing JWT token (splash screen)
 */
@RestController
@RequestMapping("/api/mobile/auth")
public class MobileAuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Student Registration.
     * Expects: { name, email, password }
     * Email must end with .edu (college email validation)
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");

        if (name == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email and password are required"));
        }

        // College email validation
        if (!email.endsWith(".edu")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please use a valid college email (.edu)"));
        }

        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password); // TODO: Hash with BCrypt in production
        user.setRole("student");

        User savedUser = userRepository.save(user);

        // Generate JWT token with student role
        String token = jwtUtil.generateToken(
            savedUser.getId(), 
            savedUser.getEmail(), 
            savedUser.getRole(), 
            savedUser.getInstitutionId()
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Registration successful");
        response.put("token", token);
        response.put("user", buildUserResponse(savedUser));

        return ResponseEntity.ok(response);
    }

    /**
     * Student Login.
     * Expects: { email, password }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        User user = userOpt.get();

        // Simple password check (in production, use BCrypt)
        if (!user.getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(
            user.getId(), 
            user.getEmail(), 
            user.getRole(), 
            user.getInstitutionId()
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("user", buildUserResponse(user));

        return ResponseEntity.ok(response);
    }

    /**
     * Validate JWT Token (used by splash screen to check if user is still logged in).
     * This is a PROTECTED endpoint — JWT filter will reject invalid tokens before reaching here.
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }

        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("valid", true);
        response.put("user", buildUserResponse(user));

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());
        userMap.put("branch", user.getBranch());
        userMap.put("admissionNumber", user.getAdmissionNumber());
        return userMap;
    }
}
