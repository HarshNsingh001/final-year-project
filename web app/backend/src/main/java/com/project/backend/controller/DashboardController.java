package com.project.backend.controller;

import com.project.backend.entity.HealthReading;
import com.project.backend.entity.User;
import com.project.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HealthReadingRepository healthReadingRepository;

    @Autowired
    private AlertRepository alertRepository;

    /**
     * Returns dashboard KPI stats for the frontend.
     * Also returns the latest reading for the "Latest Reading" card.
     */
    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats(HttpServletRequest request) {
        Long institutionId = (Long) request.getAttribute("institutionId");
        Map<String, Object> stats = new LinkedHashMap<>();

        long totalUsers = institutionId != null ? userRepository.countByInstitutionId(institutionId) : userRepository.count();
        long totalReadings = institutionId != null ? healthReadingRepository.countByInstitutionId(institutionId) : healthReadingRepository.count();
        long activeAlerts = institutionId != null ? alertRepository.countByInstitutionIdAndReviewedFalse(institutionId) : alertRepository.countByReviewedFalse();

        // Calculate average heart rate from users in this institution with readings
        List<User> users = institutionId != null ? userRepository.findByInstitutionId(institutionId) : userRepository.findAll();
        int avgHeartRate = 0;
        int count = 0;
        for (User u : users) {
            if (u.getHeartRate() != null && u.getHeartRate() > 0) {
                avgHeartRate += u.getHeartRate();
                count++;
            }
        }
        if (count > 0) {
            avgHeartRate = avgHeartRate / count;
        }

        stats.put("registeredUsers", totalUsers);
        stats.put("totalReadings", totalReadings);
        stats.put("activeAlerts", activeAlerts);
        stats.put("avgHeartRate", avgHeartRate);

        // Get latest single reading for the "Latest Reading" card
        List<HealthReading> latestReadings = institutionId != null ? 
            healthReadingRepository.findLatestReadingsByInstitutionId(institutionId, 1) : 
            healthReadingRepository.findLatestReadings(1);
            
        if (!latestReadings.isEmpty()) {
            HealthReading latest = latestReadings.get(0);
            Map<String, Object> latestMap = new LinkedHashMap<>();
            latestMap.put("heartRate", latest.getHeartRate());
            latestMap.put("spo2", latest.getSpo2());
            latestMap.put("temperature", latest.getTemperature());
            latestMap.put("userId", latest.getUserId());

            // Get user's location for this reading
            Optional<User> userOpt = userRepository.findById(latest.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                latestMap.put("lat", user.getLat());
                latestMap.put("lng", user.getLng());
                latestMap.put("userName", user.getName());
            }
            stats.put("latestReading", latestMap);
        }

        return stats;
    }
}
