package com.project.backend.controller;

import com.project.backend.entity.User;
import com.project.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<User> getAllUsers(HttpServletRequest request) {
        Long institutionId = (Long) request.getAttribute("institutionId");
        List<User> users;
        if (institutionId != null) {
            users = userRepository.findByInstitutionId(institutionId);
        } else {
            users = userRepository.findAll();
        }
        
        // Filter out admins so only students are shown
        return users.stream()
                .filter(u -> !"admin".equals(u.getRole()))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user.get());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user, HttpServletRequest request) {
        Long institutionId = (Long) request.getAttribute("institutionId");
        
        // Set defaults if not provided
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            user.setPassword("default123"); // Default password for users added by admin
        }
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            // Generate a placeholder email from the name
            user.setEmail(user.getName().toLowerCase().replaceAll("\\s+", ".") + "@healthcloud.com");
        }
        if (user.getStatus() == null) {
            user.setStatus("Normal");
        }
        if (user.getRole() == null) {
            user.setRole("student");
        }
        
        // Assign user to the admin's institution
        if (institutionId != null) {
            user.setInstitutionId(institutionId);
        }

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        Optional<User> existingOpt = userRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User existing = existingOpt.get();

        if (updatedUser.getName() != null) existing.setName(updatedUser.getName());
        if (updatedUser.getBranch() != null) existing.setBranch(updatedUser.getBranch());
        if (updatedUser.getAdmissionNumber() != null) existing.setAdmissionNumber(updatedUser.getAdmissionNumber());
        if (updatedUser.getEmergencyContact() != null) existing.setEmergencyContact(updatedUser.getEmergencyContact());
        if (updatedUser.getStatus() != null) existing.setStatus(updatedUser.getStatus());
        if (updatedUser.getLat() != null) existing.setLat(updatedUser.getLat());
        if (updatedUser.getLng() != null) existing.setLng(updatedUser.getLng());
        if (updatedUser.getHeartRate() != null) existing.setHeartRate(updatedUser.getHeartRate());
        if (updatedUser.getSpo2() != null) existing.setSpo2(updatedUser.getSpo2());
        if (updatedUser.getTemperature() != null) existing.setTemperature(updatedUser.getTemperature());

        User saved = userRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
