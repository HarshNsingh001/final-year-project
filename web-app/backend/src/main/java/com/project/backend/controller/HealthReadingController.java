package com.project.backend.controller;

import com.project.backend.entity.HealthReading;
import com.project.backend.entity.Alert;
import com.project.backend.entity.User;
import com.project.backend.repository.HealthReadingRepository;
import com.project.backend.repository.AlertRepository;
import com.project.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/readings")
public class HealthReadingController {

    @Autowired
    private HealthReadingRepository healthReadingRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<HealthReading> getAllReadings(HttpServletRequest request) {
        Long institutionId = (Long) request.getAttribute("institutionId");
        if (institutionId != null) {
            return healthReadingRepository.findByInstitutionIdOrderByRecordedAtDesc(institutionId);
        }
        return healthReadingRepository.findAllOrderByRecordedAtDesc();
    }

    @GetMapping("/user/{userId}")
    public List<HealthReading> getReadingsByUser(@PathVariable Long userId) {
        return healthReadingRepository.findByUserIdOrderByRecordedAtDesc(userId);
    }

    /**
     * Returns chart data formatted for the frontend's Vitals Timeline chart.
     * Format: [{time: "05:48 PM", heartRate: 85, spo2: 97, temperature: 36.5}, ...]
     */
    @GetMapping("/chart")
    public List<Map<String, Object>> getChartData(@RequestParam(defaultValue = "20") int limit, HttpServletRequest request) {
        Long institutionId = (Long) request.getAttribute("institutionId");
        List<HealthReading> readings = institutionId != null ? 
            healthReadingRepository.findLatestReadingsByInstitutionId(institutionId, limit) : 
            healthReadingRepository.findLatestReadings(limit);

        // Reverse to show oldest first (left to right on chart)
        Collections.reverse(readings);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");

        return readings.stream().map(r -> {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("time", r.getRecordedAt().format(formatter));
            point.put("heartRate", r.getHeartRate());
            point.put("spo2", r.getSpo2());
            point.put("temperature", r.getTemperature());
            return point;
        }).collect(Collectors.toList());
    }

    /**
     * POST a new health reading. Automatically generates alerts if vitals are abnormal.
     */
    @PostMapping
    public ResponseEntity<?> addReading(@RequestBody HealthReading reading) {
        // Fetch user info for alert messages and institution routing
        Optional<User> userOpt = userRepository.findById(reading.getUserId());
        String userName = userOpt.map(User::getName).orElse("Unknown User");
        Long institutionId = userOpt.map(User::getInstitutionId).orElse(null);
        
        reading.setInstitutionId(institutionId);
        HealthReading saved = healthReadingRepository.save(reading);

        // Auto-generate alerts based on thresholds
        List<Alert> generatedAlerts = new ArrayList<>();

        // Heart rate alert: > 120 bpm or < 50 bpm
        if (reading.getHeartRate() != null) {
            if (reading.getHeartRate() > 120) {
                Alert alert = new Alert();
                alert.setUserId(reading.getUserId());
                alert.setUserName(userName);
                alert.setInstitutionId(institutionId);
                alert.setType("HEART_RATE");
                alert.setSeverity("HIGH");
                alert.setMessage("Heart rate crossed safe limit: " + reading.getHeartRate() + " bpm");
                generatedAlerts.add(alertRepository.save(alert));
            } else if (reading.getHeartRate() < 50) {
                Alert alert = new Alert();
                alert.setUserId(reading.getUserId());
                alert.setUserName(userName);
                alert.setInstitutionId(institutionId);
                alert.setType("HEART_RATE");
                alert.setSeverity("HIGH");
                alert.setMessage("Heart rate below safe limit: " + reading.getHeartRate() + " bpm");
                generatedAlerts.add(alertRepository.save(alert));
            }
        }

        // SpO2 alert: < 90%
        if (reading.getSpo2() != null && reading.getSpo2() < 90) {
            Alert alert = new Alert();
            alert.setUserId(reading.getUserId());
            alert.setUserName(userName);
            alert.setInstitutionId(institutionId);
            alert.setType("SPO2");
            alert.setSeverity("CRITICAL");
            alert.setMessage("Oxygen saturation dropped below safe limit: " + reading.getSpo2() + "%");
            generatedAlerts.add(alertRepository.save(alert));
        }

        // Temperature alert: > 38.0 C
        if (reading.getTemperature() != null && reading.getTemperature() > 38.0) {
            Alert alert = new Alert();
            alert.setUserId(reading.getUserId());
            alert.setUserName(userName);
            alert.setInstitutionId(institutionId);
            alert.setType("TEMPERATURE");
            alert.setSeverity("MEDIUM");
            alert.setMessage("Abnormal body temperature detected: " + reading.getTemperature() + " C");
            generatedAlerts.add(alertRepository.save(alert));
        }

        // Update user's latest vitals
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setHeartRate(reading.getHeartRate());
            user.setSpo2(reading.getSpo2());
            user.setTemperature(reading.getTemperature());

            // Update user status based on alerts
            if (!generatedAlerts.isEmpty()) {
                user.setStatus("Needs Attention");
            } else {
                user.setStatus("Normal");
                // Auto-resolve: If vitals are normal, mark all existing unreviewed alerts for this user as reviewed
                List<Alert> existingAlerts = alertRepository.findByUserIdAndReviewedFalse(user.getId());
                if (!existingAlerts.isEmpty()) {
                    for (Alert a : existingAlerts) {
                        a.setReviewed(true);
                    }
                    alertRepository.saveAll(existingAlerts);
                }
            }
            userRepository.save(user);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("reading", saved);
        response.put("alertsGenerated", generatedAlerts.size());
        response.put("alerts", generatedAlerts);

        return ResponseEntity.ok(response);
    }
}
