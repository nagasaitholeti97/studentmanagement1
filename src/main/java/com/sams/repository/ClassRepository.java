package com.sams.repository;

import com.sams.model.CollegeClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassRepository extends JpaRepository<CollegeClass, UUID> {
    Optional<CollegeClass> findByCode(String code);
}
