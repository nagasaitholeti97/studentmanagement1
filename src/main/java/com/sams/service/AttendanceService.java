package com.sams.service;

import com.sams.dto.request.MarkAttendanceRequest;
import com.sams.dto.request.MarkRecordRequest;
import com.sams.dto.response.SavedMarkResponse;
import com.sams.exception.BadRequestException;
import com.sams.mapper.EntityDtoMapper;
import com.sams.model.*;
import com.sams.repository.AttendanceRepository;
import com.sams.repository.EnrollmentRepository;
import com.sams.repository.StudentRepository;
import com.sams.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ClassService classService;
    private final EntityDtoMapper mapper;
    private final CurrentUserService currentUserService;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             StudentRepository studentRepository,
                             SubjectRepository subjectRepository,
                             EnrollmentRepository enrollmentRepository,
                             ClassService classService,
                             EntityDtoMapper mapper,
                             CurrentUserService currentUserService) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.classService = classService;
        this.mapper = mapper;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<SavedMarkResponse> getSavedAttendance(String classId, LocalDate date, int period) {
        currentUserService.getCurrentFaculty(); // Must be faculty
        CollegeClass collegeClass = classService.resolveClass(classId);
        return attendanceRepository.findByCollegeClassIdAndAttendanceDateAndPeriodNumber(collegeClass.getId(), date, period)
            .stream()
            .map(mapper::toSavedMark)
            .toList();
    }

    @Transactional
    public void markAttendance(MarkAttendanceRequest request) {
        Faculty faculty = currentUserService.getCurrentFaculty();
        CollegeClass collegeClass = classService.resolveClass(request.classId());

        if (request.date().isAfter(LocalDate.now())) {
            throw new BadRequestException("You cannot mark attendance for a future date.");
        }

        Subject subject = subjectRepository.findFirstByCollegeClassIdAndFacultyId(collegeClass.getId(), faculty.getId())
            .or(() -> subjectRepository.findByCollegeClassId(collegeClass.getId()).stream().findFirst())
            .orElseThrow(() -> new BadRequestException("No subject is configured."));

        for (MarkRecordRequest record : request.records()) {
            UUID studentId;
            try {
                studentId = UUID.fromString(record.studentId());
            } catch (Exception e) {
                throw new BadRequestException("Invalid student ID.");
            }

            Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new BadRequestException("Student not found."));

            if (enrollmentRepository.findByStudentIdAndCollegeClassId(studentId, collegeClass.getId()).isEmpty()) {
                throw new BadRequestException("Student is not in this class.");
            }

            AttendanceRecord attendanceRecord = attendanceRepository
                .findByCollegeClassIdAndAttendanceDateAndPeriodNumber(collegeClass.getId(), request.date(), request.period())
                .stream()
                .filter(a -> a.getStudent().getId().equals(studentId))
                .findFirst()
                .orElseGet(AttendanceRecord::new);

            attendanceRecord.setStudent(student);
            attendanceRecord.setCollegeClass(collegeClass);
            attendanceRecord.setSubject(subject);
            attendanceRecord.setMarkedBy(faculty);
            attendanceRecord.setAttendanceDate(request.date());
            attendanceRecord.setPeriodNumber(request.period());
            attendanceRecord.setStatus(record.status());
            attendanceRecord.setUpdatedAt(Instant.now());

            attendanceRepository.save(attendanceRecord);
        }
    }
}
