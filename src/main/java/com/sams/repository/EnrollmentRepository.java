package com.sams.repository;

import com.sams.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findByCollegeClassId(UUID classId);
    List<Enrollment> findByStudentId(UUID studentId);
    Optional<Enrollment> findByStudentIdAndCollegeClassId(UUID studentId, UUID classId);
}
