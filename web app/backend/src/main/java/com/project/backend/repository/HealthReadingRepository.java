package com.project.backend.repository;

import com.project.backend.entity.HealthReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HealthReadingRepository extends JpaRepository<HealthReading, Long> {
    List<HealthReading> findByUserIdOrderByRecordedAtDesc(Long userId);

    @Query("SELECT h FROM HealthReading h ORDER BY h.recordedAt DESC")
    List<HealthReading> findAllOrderByRecordedAtDesc();

    @Query("SELECT h FROM HealthReading h WHERE h.institutionId = ?1 ORDER BY h.recordedAt DESC")
    List<HealthReading> findByInstitutionIdOrderByRecordedAtDesc(Long institutionId);

    @Query(value = "SELECT * FROM health_readings ORDER BY recorded_at DESC LIMIT ?1", nativeQuery = true)
    List<HealthReading> findLatestReadings(int limit);

    @Query(value = "SELECT * FROM health_readings WHERE institution_id = ?1 ORDER BY recorded_at DESC LIMIT ?2", nativeQuery = true)
    List<HealthReading> findLatestReadingsByInstitutionId(Long institutionId, int limit);

    // Mobile app specific queries
    @Query(value = "SELECT * FROM health_readings WHERE user_id = ?1 ORDER BY recorded_at DESC LIMIT ?2", nativeQuery = true)
    List<HealthReading> findLatestByUserId(Long userId, int limit);

    @Query("SELECT h FROM HealthReading h WHERE h.userId = ?1 AND h.recordedAt BETWEEN ?2 AND ?3 ORDER BY h.recordedAt DESC")
    List<HealthReading> findByUserIdAndRecordedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT AVG(h.heartRate) FROM HealthReading h WHERE h.userId = ?1 AND h.recordedAt BETWEEN ?2 AND ?3")
    Double findAvgHeartRateByUserIdAndPeriod(Long userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(MAX(h.steps), 0) FROM HealthReading h WHERE h.userId = ?1 AND h.recordedAt BETWEEN ?2 AND ?3")
    Integer findMaxStepsByUserIdAndPeriod(Long userId, LocalDateTime start, LocalDateTime end);

    long count();
    long countByInstitutionId(Long institutionId);
    long countByUserId(Long userId);

    @Query("SELECT AVG(h.spo2) FROM HealthReading h WHERE h.userId = ?1 AND h.recordedAt BETWEEN ?2 AND ?3 AND h.spo2 IS NOT NULL AND h.spo2 > 0")
    Double findAvgSpo2ByUserIdAndPeriod(Long userId, LocalDateTime start, LocalDateTime end);
}
