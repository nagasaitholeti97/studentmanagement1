package com.sams.repository;

import com.sams.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceRecord, UUID> {
    List<AttendanceRecord> findByStudentIdOrderByAttendanceDateAscPeriodNumberAsc(UUID studentId);
    List<AttendanceRecord> findByCollegeClassIdAndAttendanceDateAndPeriodNumber(UUID classId, LocalDate date, Integer period);
    List<AttendanceRecord> findByStudentIdAndAttendanceDateBetween(UUID studentId, LocalDate from, LocalDate to);
}
