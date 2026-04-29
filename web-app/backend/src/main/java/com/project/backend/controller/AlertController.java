package com.project.backend.controller;

import com.project.backend.entity.Alert;
import com.project.backend.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    /**
     * Get all alerts, formatted for frontend.
     * Format: [{id, type, user, time, severity, message}, ...]
     */
    @GetMapping
    public List<Map<String, Object>> getAllAlerts(HttpServletRequest request) {
        Long institutionId = (Long) request.getAttribute("institutionId");
        List<Alert> alerts = institutionId != null ? 
            alertRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId) : 
            alertRepository.findAllByOrderByCreatedAtDesc();
            
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("M/d/yyyy, h:mm:ss a");

        return alerts.stream().map(a -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", a.getId());
            map.put("type", a.getType());
            map.put("user", a.getUserName());
            map.put("time", a.getCreatedAt().format(formatter));
            map.put("severity", a.getSeverity());
            map.put("message", a.getMessage());
            map.put("reviewed", a.getReviewed());
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/active")
    public List<Map<String, Object>> getActiveAlerts(HttpServletRequest request) {
        Long institutionId = (Long) request.getAttribute("institutionId");
        List<Alert> alerts = institutionId != null ? 
            alertRepository.findByInstitutionIdAndReviewedFalseOrderByCreatedAtDesc(institutionId) : 
            alertRepository.findByReviewedFalseOrderByCreatedAtDesc();
            
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("M/d/yyyy, h:mm:ss a");

        return alerts.stream().map(a -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", a.getId());
            map.put("type", a.getType());
            map.put("user", a.getUserName());
            map.put("time", a.getCreatedAt().format(formatter));
            map.put("severity", a.getSeverity());
            map.put("message", a.getMessage());
            map.put("reviewed", a.getReviewed());
            return map;
        }).collect(Collectors.toList());
    }

    @PutMapping("/{id}/reviewed")
    public ResponseEntity<?> markReviewed(@PathVariable Long id) {
        Optional<Alert> alertOpt = alertRepository.findById(id);
        if (alertOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Alert alert = alertOpt.get();
        alert.setReviewed(true);
        alertRepository.save(alert);
        return ResponseEntity.ok(Map.of("message", "Alert marked as reviewed"));
    }
}
