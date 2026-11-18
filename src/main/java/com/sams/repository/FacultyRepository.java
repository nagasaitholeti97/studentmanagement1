
package com.sams.repository;

import com.sams.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, UUID> {

    Optional<Faculty> findByUserId(UUID userId);

    Optional<Faculty> findByPersonalEmailIgnoreCase(String personalEmail);

    Optional<Faculty> findByFacultyIdIgnoreCase(String facultyId);
}
