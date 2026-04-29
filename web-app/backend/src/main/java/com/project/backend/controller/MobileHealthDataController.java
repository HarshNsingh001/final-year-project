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
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Health Data Controller for the Mobile App.
 * All endpoints require JWT authentication.
 * UserId is extracted from JWT token (not from URL).
 *
 * Endpoints:
 *   POST /api/mobile/health-data         - Batch upload health readings
 *   GET  /api/mobile/health-data/latest   - Get latest vitals
 *   GET  /api/mobile/health-data/history  - Get history with period filter
 *   GET  /api/mobile/health-data/summary  - Get dashboard summary stats
 */
@RestController
@RequestMapping("/api/mobile/health-data")
public class MobileHealthDataController {

    @Autowired
    private HealthReadingRepository healthReadingRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Batch upload health readings from smartwatch.
     * The mobile app collects data every 2s and sends in batches every 10s.
     * 
     * Request body:
     * {
     *   "items": [
     *     { "heartRate": 75, "steps": 120, "timestamp": 1714050000000 },
     *     { "heartRate": 78, "steps": 125, "timestamp": 1714050005000 }
     *   ]
     * }
     */
    @PostMapping
    public ResponseEntity<?> batchUpload(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        Long institutionId = user.getInstitutionId();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");

        if (items == null || items.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No health data items provided"));
        }

        List<HealthReading> savedReadings = new ArrayList<>();
        List<Alert> generatedAlerts = new ArrayList<>();

        for (Map<String, Object> item : items) {
            HealthReading reading = new HealthReading();
            reading.setUserId(userId);
            reading.setInstitutionId(institutionId);

            // Parse heart rate
            if (item.get("heartRate") != null) {
                reading.setHeartRate(((Number) item.get("heartRate")).intValue());
            }

            // Parse steps
            if (item.get("steps") != null) {
                reading.setSteps(((Number) item.get("steps")).intValue());
            }

            // Parse temperature (optional)
            if (item.get("temperature") != null) {
                reading.setTemperature(((Number) item.get("temperature")).doubleValue());
            }

            // Parse spo2 (optional)
            if (item.get("spo2") != null) {
                reading.setSpo2(((Number) item.get("spo2")).intValue());
            }

            // Parse timestamp
            if (item.get("timestamp") != null) {
                long ts = ((Number) item.get("timestamp")).longValue();
                reading.setRecordedAt(LocalDateTime.ofInstant(
                    Instant.ofEpochMilli(ts), ZoneId.systemDefault()
                ));
            }

            HealthReading saved = healthReadingRepository.save(reading);
            savedReadings.add(saved);
        // ═══════════════════════════════════════════════════════
        // MEDICAL-STANDARD ALERT SYSTEM
        // Based on WHO/AHA clinical guidelines for adults (18+)
        // ═══════════════════════════════════════════════════════

            // ── HEART RATE ALERTS ──
            // Normal resting: 60-100 BPM (American Heart Association)
            // Tachycardia: > 100 BPM | Bradycardia: < 60 BPM
            if (reading.getHeartRate() != null && reading.getHeartRate() > 0) {
                int hr = reading.getHeartRate();

                if (hr > 150) {
                    generatedAlerts.add(createAlert(userId, user.getName(), institutionId,
                        "HEART_RATE", "CRITICAL",
                        "Dangerously high heart rate: " + hr + " bpm. Immediate medical attention recommended."));
                } else if (hr > 120) {
                    generatedAlerts.add(createAlert(userId, user.getName(), institutionId,
                        "HEART_RATE", "HIGH",
                        "Heart rate elevated: " + hr + " bpm. Exceeds safe resting limit (100 bpm)."));
                } else if (hr < 40) {
                    generatedAlerts.add(createAlert(userId, user.getName(), institutionId,
                        "HEART_RATE", "CRITICAL",
                        "Dangerously low heart rate: " + hr + " bpm. Immediate medical attention recommended."));
                } else if (hr < 50) {
                    generatedAlerts.add(createAlert(userId, user.getName(), institutionId,
                        "HEART_RATE", "HIGH",
                        "Heart rate below normal: " + hr + " bpm. Normal resting range is 60-100 bpm."));
                }
            }

            // ── SpO2 (BLOOD OXYGEN) ALERTS ──
            // Normal: 95-100% (WHO standard)
            // Hypoxemia: < 95% | Severe: < 90% | Critical: < 85%
            if (reading.getSpo2() != null && reading.getSpo2() > 0) {
                int spo2 = reading.getSpo2();

                if (spo2 < 85) {
                    generatedAlerts.add(createAlert(userId, user.getName(), institutionId,
                        "SPO2", "CRITICAL",
                        "Severe hypoxemia: SpO2 at " + spo2 + "%. Requires emergency medical attention."));
                } else if (spo2 < 90) {
                    generatedAlerts.add(createAlert(userId, user.getName(), institutionId,
                        "SPO2", "HIGH",
                        "Low blood oxygen: SpO2 at " + spo2 + "%. Normal range is 95-100%."));
                } else if (spo2 < 94) {
                    generatedAlerts.add(createAlert(userId, user.getName(), institutionId,
                        "SPO2", "MEDIUM",
                        "Blood oxygen slightly low: SpO2 at " + spo2 + "%. Monitor closely."));
                }
            }

            // ── BODY TEMPERATURE ALERTS ──
            // Normal: 36.1°C - 37.2°C (WHO standard)
            // Fever: > 38°C | High fever: > 39°C | Hypothermia: < 35°C
            if (reading.getTemperature() != null && reading.getTemperature() > 0) {
                double temp = reading.getTemperature();

                if (temp > 39.5) {
                    generatedAlerts.add(createAlert(userId, user.getName(), institutionId,
                        "TEMPERATURE", "CRITICAL",
                        "Very high fever: " + temp + "°C. Immediate medical attention needed."));
                } else if (temp > 38.0) {
                    generatedAlerts.add(createAlert(userId, user.getName(), institutionId,
                        "TEMPERATURE", "HIGH",
                        "Fever detected: " + temp + "°C. Normal body temperature is 36.1-37.2°C."));
                } else if (temp > 37.2) {
                    generatedAlerts.add(createAlert(userId, user.getName(), institutionId,
                        "TEMPERATURE", "MEDIUM",
                        "Mild elevated temperature: " + temp + "°C. Low-grade fever range."));
                } else if (temp < 35.0) {
                    generatedAlerts.add(createAlert(userId, user.getName(), institutionId,
                        "TEMPERATURE", "HIGH",
                        "Hypothermia risk: " + temp + "°C. Body temperature below safe limit."));
                }
            }
        }

        // Update user's latest vitals with the last reading
        if (!savedReadings.isEmpty()) {
            HealthReading lastReading = savedReadings.get(savedReadings.size() - 1);
            user.setHeartRate(lastReading.getHeartRate());
            if (lastReading.getSteps() != null) user.setSteps(lastReading.getSteps());
            if (lastReading.getSpo2() != null) user.setSpo2(lastReading.getSpo2());
            if (lastReading.getTemperature() != null) user.setTemperature(lastReading.getTemperature());

            if (!generatedAlerts.isEmpty()) {
                user.setStatus("Needs Attention");
            } else {
                user.setStatus("Normal");
            }
            userRepository.save(user);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("saved", savedReadings.size());
        response.put("alertsGenerated", generatedAlerts.size());

        return ResponseEntity.ok(response);
    }

    /**
     * Get latest vitals for the logged-in student.
     */
    @GetMapping("/latest")
    public ResponseEntity<?> getLatestVitals(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        List<HealthReading> latest = healthReadingRepository.findLatestByUserId(userId, 1);

        if (latest.isEmpty()) {
            Map<String, Object> emptyResponse = new LinkedHashMap<>();
            emptyResponse.put("heartRate", 0);
            emptyResponse.put("steps", 0);
            emptyResponse.put("temperature", 0);
            emptyResponse.put("spo2", 0);
            emptyResponse.put("lastUpdated", null);
            return ResponseEntity.ok(emptyResponse);
        }

        HealthReading reading = latest.get(0);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("heartRate", reading.getHeartRate());
        response.put("steps", reading.getSteps());
        response.put("temperature", reading.getTemperature());
        response.put("spo2", reading.getSpo2());
        response.put("lastUpdated", reading.getRecordedAt());

        return ResponseEntity.ok(response);
    }

    /**
     * Get health data history with period filtering.
     * Query params:
     *   period = "daily" | "weekly" | "monthly" (default: "daily")
     *   days = number of days to look back (default: 7 for daily, 4 for weekly, 6 for monthly)
     * 
     * Returns aggregated data per period.
     */
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            @RequestParam(defaultValue = "daily") String period,
            @RequestParam(required = false) Integer days,
            HttpServletRequest request) {

        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        LocalDateTime now = LocalDateTime.now();
        List<Map<String, Object>> result = new ArrayList<>();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        switch (period) {
            case "weekly": {
                int weeksBack = days != null ? days : 4;
                for (int i = weeksBack - 1; i >= 0; i--) {
                    LocalDateTime weekStart = now.minusWeeks(i).with(DayOfWeek.MONDAY).toLocalDate().atStartOfDay();
                    LocalDateTime weekEnd = weekStart.plusWeeks(1);

                    Double avgHr = healthReadingRepository.findAvgHeartRateByUserIdAndPeriod(userId, weekStart, weekEnd);
                    Integer maxSteps = healthReadingRepository.findMaxStepsByUserIdAndPeriod(userId, weekStart, weekEnd);

                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("label", "Week " + weekStart.format(DateTimeFormatter.ofPattern("MMM dd")));
                    entry.put("startDate", weekStart.format(dateFormatter));
                    entry.put("endDate", weekEnd.format(dateFormatter));
                    entry.put("avgHeartRate", avgHr != null ? Math.round(avgHr) : 0);
                    entry.put("totalSteps", maxSteps != null ? maxSteps : 0);
                    result.add(entry);
                }
                break;
            }
            case "monthly": {
                int monthsBack = days != null ? days : 6;
                for (int i = monthsBack - 1; i >= 0; i--) {
                    LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).toLocalDate().atStartOfDay();
                    LocalDateTime monthEnd = monthStart.plusMonths(1);

                    Double avgHr = healthReadingRepository.findAvgHeartRateByUserIdAndPeriod(userId, monthStart, monthEnd);
                    Integer maxSteps = healthReadingRepository.findMaxStepsByUserIdAndPeriod(userId, monthStart, monthEnd);

                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("label", monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy")));
                    entry.put("startDate", monthStart.format(dateFormatter));
                    entry.put("avgHeartRate", avgHr != null ? Math.round(avgHr) : 0);
                    entry.put("totalSteps", maxSteps != null ? maxSteps : 0);
                    result.add(entry);
                }
                break;
            }
            default: { // daily
                int daysBack = days != null ? days : 7;
                for (int i = daysBack - 1; i >= 0; i--) {
                    LocalDateTime dayStart = now.minusDays(i).toLocalDate().atStartOfDay();
                    LocalDateTime dayEnd = dayStart.plusDays(1);

                    Double avgHr = healthReadingRepository.findAvgHeartRateByUserIdAndPeriod(userId, dayStart, dayEnd);
                    Integer maxSteps = healthReadingRepository.findMaxStepsByUserIdAndPeriod(userId, dayStart, dayEnd);

                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("date", dayStart.format(dateFormatter));
                    entry.put("label", dayStart.format(DateTimeFormatter.ofPattern("EEE")));
                    entry.put("avgHeartRate", avgHr != null ? Math.round(avgHr) : 0);
                    entry.put("totalSteps", maxSteps != null ? maxSteps : 0);
                    result.add(entry);
                }
                break;
            }
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Get dashboard summary stats for the logged-in student.
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);

        Double todayAvgHr = healthReadingRepository.findAvgHeartRateByUserIdAndPeriod(userId, todayStart, todayEnd);
        Integer todayMaxSteps = healthReadingRepository.findMaxStepsByUserIdAndPeriod(userId, todayStart, todayEnd);
        Double todayAvgSpo2 = healthReadingRepository.findAvgSpo2ByUserIdAndPeriod(userId, todayStart, todayEnd);
        long totalReadings = healthReadingRepository.countByUserId(userId);

        // Get latest reading
        List<HealthReading> latest = healthReadingRepository.findLatestByUserId(userId, 1);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("todayAvgHeartRate", todayAvgHr != null ? Math.round(todayAvgHr) : 0);
        response.put("todaySteps", todayMaxSteps != null ? todayMaxSteps : 0);
        response.put("todayAvgSpo2", todayAvgSpo2 != null ? Math.round(todayAvgSpo2) : 0);
        response.put("totalReadings", totalReadings);
        response.put("lastSyncTime", latest.isEmpty() ? null : latest.get(0).getRecordedAt());

        return ResponseEntity.ok(response);
    }

    // Helper method to create alerts
    private Alert createAlert(Long userId, String userName, Long institutionId,
                              String type, String severity, String message) {
        Alert alert = new Alert();
        alert.setUserId(userId);
        alert.setUserName(userName);
        alert.setInstitutionId(institutionId);
        alert.setType(type);
        alert.setSeverity(severity);
        alert.setMessage(message);
        return alertRepository.save(alert);
    }
}
