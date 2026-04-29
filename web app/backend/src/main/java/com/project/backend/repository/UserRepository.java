package com.project.backend.repository;

import com.project.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long count();
    
    List<User> findByInstitutionId(Long institutionId);
    long countByInstitutionId(Long institutionId);
}
