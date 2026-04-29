package com.project.backend.controller;

import com.project.backend.entity.Alert;
import com.project.backend.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Alert Controller for the Mobile App.
 * All endpoints require JWT authentication.
 *
 * Endpoints:
 *   GET /api/mobile/alerts        - Get all alerts for the student
 *   GET /api/mobile/alerts/unread - Get unread alert count
 */
@RestController
@RequestMapping("/api/mobile/alerts")
public class MobileAlertController {

    @Autowired
    private AlertRepository alertRepository;

    /**
     * Get all alerts for the logged-in student.
     */
    @GetMapping
    public ResponseEntity<?> getAlerts(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        List<Alert> alerts = alertRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(alerts);
    }

    /**
     * Get count of unread alerts for the logged-in student.
     */
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadCount(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        List<Alert> unreviewedAlerts = alertRepository.findByUserIdAndReviewedFalse(userId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("unreadCount", unreviewedAlerts.size());

        return ResponseEntity.ok(response);
    }
}
