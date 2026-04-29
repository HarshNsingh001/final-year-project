package com.project.backend.config;

import com.project.backend.entity.*;
import com.project.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Seeds the database with initial mock data if tables are empty.
 * This runs once when the Spring Boot app starts.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private HealthReadingRepository healthReadingRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private LocationUpdateRepository locationUpdateRepository;

    @Override
    public void run(String... args) {
        // Only seed if the database is empty
        if (userRepository.count() > 0) {
            System.out.println("Database already has data. Skipping seed.");
            return;
        }

        System.out.println("Seeding database with initial data...");
        
        // --- Institutions (Colleges) ---
        Institution akgec = new Institution();
        akgec.setName("Ajay Kumar Garg Engineering College");
        akgec.setCode("AKGEC");
        akgec.setCity("Ghaziabad");
        akgec.setState("UP");
        akgec = institutionRepository.save(akgec);
        
        Institution iitd = new Institution();
        iitd.setName("Indian Institute of Technology Delhi");
        iitd.setCode("IIT-D");
        iitd.setCity("New Delhi");
        iitd.setState("Delhi");
        iitd = institutionRepository.save(iitd);

        // --- Users ---
        // AKGEC Students
        User u1 = createUser("Aman Sharma", "aman@healthcloud.com", "password123",
                "CSE-101 - Computer Science", "Normal", 100, 93, 37.0,
                "+91 90000 11111", 28.61810, 77.21420, akgec.getId());

        User u2 = createUser("Priya Verma", "priya@healthcloud.com", "password123",
                "CSE-102 - Computer Science", "Normal", 73, 95, 36.6,
                "+91 90000 22222", 28.62159, 77.21897, akgec.getId());

        // IIT-D Students
        User u3 = createUser("Rahul Singh", "rahul@healthcloud.com", "password123",
                "ECE-201 - Electronics", "Needs Attention", 132, 88, 38.4,
                "+91 90000 33333", 28.61810, 77.21420, iitd.getId());

        User u4 = createUser("Neha Gupta", "neha@healthcloud.com", "password123",
                "ME-301 - Mechanical", "Normal", 80, 95, 36.9,
                "+91 90000 44444", 28.62045, 77.21854, iitd.getId());

        // Create admin users for each college
        Admin adminAkgec = new Admin();
        adminAkgec.setName("Admin AKGEC");
        adminAkgec.setEmail("admin.akgec@healthcloud.com");
        adminAkgec.setPassword("admin123");
        adminAkgec.setRole("admin");
        adminAkgec.setInstitutionId(akgec.getId());
        adminRepository.save(adminAkgec);
        
        Admin adminIitd = new Admin();
        adminIitd.setName("Admin IITD");
        adminIitd.setEmail("admin.iitd@healthcloud.com");
        adminIitd.setPassword("admin123");
        adminIitd.setRole("admin");
        adminIitd.setInstitutionId(iitd.getId());
        adminRepository.save(adminIitd);

        // --- Health Readings (Chart data) ---
        LocalDateTime now = LocalDateTime.now();

        createReading(u3.getId(), 85, 97, 36.5, now.minusMinutes(5), iitd.getId());
        createReading(u3.getId(), 88, 96, 36.6, now.minusMinutes(4), iitd.getId());
        createReading(u3.getId(), 95, 95, 36.8, now.minusMinutes(3), iitd.getId());
        createReading(u3.getId(), 91, 96, 37.0, now.minusMinutes(2), iitd.getId());
        createReading(u3.getId(), 89, 95, 37.5, now.minusMinutes(1), iitd.getId());
        createReading(u3.getId(), 132, 88, 38.4, now, iitd.getId());

        // Some readings for other users too
        createReading(u1.getId(), 100, 93, 37.0, now, akgec.getId());
        createReading(u2.getId(), 73, 95, 36.6, now, akgec.getId());
        createReading(u4.getId(), 80, 95, 36.9, now, iitd.getId());

        // --- Alerts ---
        createAlert(u3.getId(), "Rahul Singh", "TEMPERATURE", "MEDIUM",
                "Abnormal body temperature detected: 38.4 C", iitd.getId());
        createAlert(u3.getId(), "Rahul Singh", "SPO2", "CRITICAL",
                "Oxygen saturation dropped below safe limit: 88%", iitd.getId());
        createAlert(u3.getId(), "Rahul Singh", "HEART_RATE", "HIGH",
                "Heart rate crossed safe limit: 132 bpm", iitd.getId());

        // --- Location Updates ---
        createLocation(u3.getId(), "Rahul Singh", 28.61810, 77.21420, now, iitd.getId());
        createLocation(u4.getId(), "Neha Gupta", 28.62159, 77.21897, now.minusSeconds(30), iitd.getId());
        createLocation(u4.getId(), "Neha Gupta", 28.62045, 77.21854, now, iitd.getId());

        System.out.println("Database seeding complete! " +
                institutionRepository.count() + " institutions, " +
                userRepository.count() + " users, " +
                healthReadingRepository.count() + " readings, " +
                alertRepository.count() + " alerts, " +
                locationUpdateRepository.count() + " location updates.");
    }

    private User createUser(String name, String email, String password,
                            String branch, String status, int heartRate,
                            int spo2, double temperature, String emergencyContact,
                            double lat, double lng, Long institutionId) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(password);
        u.setBranch(branch);
        u.setStatus(status);
        u.setHeartRate(heartRate);
        u.setSpo2(spo2);
        u.setTemperature(temperature);
        u.setEmergencyContact(emergencyContact);
        u.setLat(lat);
        u.setLng(lng);
        u.setRole("student");
        u.setInstitutionId(institutionId);
        return userRepository.save(u);
    }

    private void createReading(Long userId, int heartRate, int spo2,
                               double temperature, LocalDateTime recordedAt, Long institutionId) {
        HealthReading r = new HealthReading();
        r.setUserId(userId);
        r.setHeartRate(heartRate);
        r.setSpo2(spo2);
        r.setTemperature(temperature);
        r.setRecordedAt(recordedAt);
        r.setInstitutionId(institutionId);
        healthReadingRepository.save(r);
    }

    private void createAlert(Long userId, String userName, String type,
                             String severity, String message, Long institutionId) {
        Alert a = new Alert();
        a.setUserId(userId);
        a.setUserName(userName);
        a.setType(type);
        a.setSeverity(severity);
        a.setMessage(message);
        a.setInstitutionId(institutionId);
        alertRepository.save(a);
    }

    private void createLocation(Long userId, String userName, double lat,
                                double lng, LocalDateTime recordedAt, Long institutionId) {
        LocationUpdate l = new LocationUpdate();
        l.setUserId(userId);
        l.setUserName(userName);
        l.setLat(lat);
        l.setLng(lng);
        l.setRecordedAt(recordedAt);
        l.setInstitutionId(institutionId);
        locationUpdateRepository.save(l);
    }
}
