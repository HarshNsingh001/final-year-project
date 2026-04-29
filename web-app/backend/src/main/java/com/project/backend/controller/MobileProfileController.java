package com.project.backend.controller;

import com.project.backend.entity.User;
import com.project.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Profile Controller for the Mobile App.
 * All endpoints require JWT authentication.
 *
 * Endpoints:
 *   GET  /api/mobile/profile  - Get student profile
 *   PUT  /api/mobile/profile  - Update student profile
 */
@RestController
@RequestMapping("/api/mobile/profile")
public class MobileProfileController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get the logged-in student's profile.
     */
    @GetMapping
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("branch", user.getBranch());
        profile.put("admissionNumber", user.getAdmissionNumber());
        profile.put("emergencyContact", user.getEmergencyContact());
        profile.put("status", user.getStatus());
        profile.put("role", user.getRole());
        profile.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(profile);
    }

    /**
     * Update the logged-in student's profile.
     * Allowed fields: name, branch, admissionNumber, emergencyContact
     */
    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        if (body.containsKey("name")) user.setName(body.get("name"));
        if (body.containsKey("branch")) user.setBranch(body.get("branch"));
        if (body.containsKey("admissionNumber")) user.setAdmissionNumber(body.get("admissionNumber"));
        if (body.containsKey("emergencyContact")) user.setEmergencyContact(body.get("emergencyContact"));

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }
}
