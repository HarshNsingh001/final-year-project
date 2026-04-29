package com.project.backend.controller;

import com.project.backend.entity.Admin;
import com.project.backend.repository.AdminRepository;
import com.project.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");

        if (name == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email and password are required"));
        }

        if (adminRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        Admin admin = new Admin();
        admin.setName(name);
        admin.setEmail(email);
        admin.setPassword(password); // In production, hash with BCrypt
        admin.setRole("admin");

        Admin savedAdmin = adminRepository.save(admin);

        // Generate JWT token
        String token = jwtUtil.generateToken(savedAdmin.getId(), savedAdmin.getEmail(), savedAdmin.getRole(), savedAdmin.getInstitutionId());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Registration successful");
        response.put("token", token);
        response.put("user", Map.of(
            "id", savedAdmin.getId(),
            "name", savedAdmin.getName(),
            "email", savedAdmin.getEmail(),
            "role", savedAdmin.getRole()
        ));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Optional<Admin> adminOpt = adminRepository.findByEmail(email);

        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        Admin admin = adminOpt.get();

        // Simple password check (in production, use BCrypt)
        if (!admin.getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(admin.getId(), admin.getEmail(), admin.getRole(), admin.getInstitutionId());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("user", Map.of(
            "id", admin.getId(),
            "name", admin.getName(),
            "email", admin.getEmail(),
            "role", admin.getRole()
        ));

        return ResponseEntity.ok(response);
    }
}
