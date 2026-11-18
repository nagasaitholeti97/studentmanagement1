
package com.sams.repository;

import com.sams.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {

    Optional<Student> findByUserId(UUID userId);

    List<Student> findByIdIn(Collection<UUID> ids);

    Optional<Student> findByPersonalEmailIgnoreCase(String personalEmail);

    boolean existsByRollNoIgnoreCase(String rollNo);
}
