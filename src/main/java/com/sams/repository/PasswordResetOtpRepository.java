package com.sams.repository;

import com.sams.model.PasswordResetOtp;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, UUID> {

    List<PasswordResetOtp> findAllByUserIdAndUsedAtIsNull(UUID userId);

    Optional<PasswordResetOtp> findTopByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(UUID userId);

    Optional<PasswordResetOtp> findTopByUserIdOrderByCreatedAtDesc(UUID userId);

    long countByUserIdAndCreatedAtAfter(UUID userId, Instant since);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM PasswordResetOtp o WHERE o.id = :id")
    Optional<PasswordResetOtp> findByIdForUpdate(@Param("id") UUID id);
}
