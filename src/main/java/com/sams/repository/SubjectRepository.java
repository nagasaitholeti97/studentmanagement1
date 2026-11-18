package com.sams.repository;

import com.sams.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    List<Subject> findByCollegeClassId(UUID classId);
    List<Subject> findByFacultyId(UUID facultyId);
    Optional<Subject> findFirstByCollegeClassIdAndFacultyId(UUID classId, UUID facultyId);
}
