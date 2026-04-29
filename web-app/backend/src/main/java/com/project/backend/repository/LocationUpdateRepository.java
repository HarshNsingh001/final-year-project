package com.project.backend.repository;

import com.project.backend.entity.LocationUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationUpdateRepository extends JpaRepository<LocationUpdate, Long> {
    @Query(value = "SELECT * FROM location_updates ORDER BY recorded_at DESC LIMIT ?1", nativeQuery = true)
    List<LocationUpdate> findLatestUpdates(int limit);

    @Query(value = "SELECT * FROM location_updates WHERE institution_id = ?1 ORDER BY recorded_at DESC LIMIT ?2", nativeQuery = true)
    List<LocationUpdate> findLatestUpdatesByInstitutionId(Long institutionId, int limit);

    List<LocationUpdate> findByUserIdOrderByRecordedAtDesc(Long userId);
}
