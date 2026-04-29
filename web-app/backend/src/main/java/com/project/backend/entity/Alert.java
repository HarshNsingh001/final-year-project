package com.project.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name")
    private String userName;

    @Column(nullable = false)
    private String type; // HEART_RATE, SPO2, TEMPERATURE

    @Column(nullable = false)
    private String severity; // CRITICAL, HIGH, MEDIUM, LOW

    @Column(nullable = false)
    private String message;

    @Column(columnDefinition = "boolean default false")
    private Boolean reviewed = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "institution_id")
    private Long institutionId;

    public Alert() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getReviewed() { return reviewed; }
    public void setReviewed(Boolean reviewed) { this.reviewed = reviewed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
}
