package com.project.backend.repository;

import com.project.backend.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findAllByOrderByCreatedAtDesc();
    List<Alert> findByReviewedFalseOrderByCreatedAtDesc();
    long countByReviewedFalse();

    List<Alert> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
    List<Alert> findByInstitutionIdAndReviewedFalseOrderByCreatedAtDesc(Long institutionId);
    long countByInstitutionIdAndReviewedFalse(Long institutionId);

    // Mobile app - student-specific queries
    List<Alert> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Alert> findByUserIdAndReviewedFalse(Long userId);
}
