package com.project.backend.controller;

import com.project.backend.entity.LocationUpdate;
import com.project.backend.entity.User;
import com.project.backend.repository.LocationUpdateRepository;
import com.project.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    @Autowired
    private LocationUpdateRepository locationUpdateRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get latest location updates formatted for the frontend.
     * Format: [{id, name, lat, lng, time}, ...]
     */
    @GetMapping
    public List<Map<String, Object>> getLatestLocations(@RequestParam(defaultValue = "20") int limit, HttpServletRequest request) {
        Long institutionId = (Long) request.getAttribute("institutionId");
        List<LocationUpdate> updates = institutionId != null ? 
            locationUpdateRepository.findLatestUpdatesByInstitutionId(institutionId, limit) : 
            locationUpdateRepository.findLatestUpdates(limit);
            
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("h:mm:ss a");

        return updates.stream().map(u -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getUserName());
            map.put("lat", u.getLat());
            map.put("lng", u.getLng());
            map.put("time", u.getRecordedAt().format(formatter));
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * Post a new location update. Also updates the user's lat/lng.
     */
    @PostMapping
    public ResponseEntity<?> addLocationUpdate(@RequestBody LocationUpdate update) {
        // Find user to set name and institution, and update their location
        Optional<User> userOpt = userRepository.findById(update.getUserId());
        userOpt.ifPresent(u -> {
            if (update.getUserName() == null || update.getUserName().isEmpty()) {
                update.setUserName(u.getName());
            }
            update.setInstitutionId(u.getInstitutionId());
            
            // Update user's latest location
            u.setLat(update.getLat());
            u.setLng(update.getLng());
            userRepository.save(u);
        });

        LocationUpdate saved = locationUpdateRepository.save(update);

        return ResponseEntity.ok(saved);
    }
}
