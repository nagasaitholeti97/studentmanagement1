
package com.sams.service;

import com.sams.dto.request.ContactUpdateRequest;
import com.sams.dto.response.*;
import com.sams.exception.BadRequestException;
import com.sams.mapper.EntityDtoMapper;
import com.sams.model.AttendanceRecord;
import com.sams.model.AttendanceStatus;
import com.sams.model.Enrollment;
import com.sams.model.Student;
import com.sams.model.Subject;
import com.sams.repository.AttendanceRepository;
import com.sams.repository.EnrollmentRepository;
import com.sams.repository.StudentRepository;
import com.sams.repository.SubjectRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SubjectRepository subjectRepository;
    private final EntityDtoMapper mapper;
    private final CurrentUserService currentUserService;

    public StudentService(
            AttendanceRepository attendanceRepository,
            StudentRepository studentRepository,
            EnrollmentRepository enrollmentRepository,
            SubjectRepository subjectRepository,
            EntityDtoMapper mapper,
            CurrentUserService currentUserService) {

        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.subjectRepository = subjectRepository;
        this.mapper = mapper;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getStudentProfile() {
        Student student = currentUserService.getCurrentStudent();
        return mapper.toStudentProfile(student);
    }

    @Transactional
    public StudentProfileResponse updateContact(ContactUpdateRequest request) {
        Student student = currentUserService.getCurrentStudent();

        String newPersonalEmail = request.personalEmail() != null
                ? request.personalEmail().trim()
                : null;

        String currentPersonalEmail = student.getPersonalEmail() != null
                ? student.getPersonalEmail().trim()
                : "";

        if (newPersonalEmail != null
                && !newPersonalEmail.isEmpty()
                && !newPersonalEmail.equalsIgnoreCase(currentPersonalEmail)) {

            studentRepository.findByPersonalEmailIgnoreCase(newPersonalEmail)
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(student.getId())) {
                            throw new BadRequestException(
                                    "Personal email is already registered to another student account.");
                        }
                    });
        }

        student.setPhone(request.phone() != null ? request.phone().trim() : null);
        student.setPersonalEmail(newPersonalEmail);

        Student saved = studentRepository.save(student);

        return mapper.toStudentProfile(saved);
    }

    @Transactional(readOnly = true)
    public AcademicRegisterResponse getRegister() {
        Student student = currentUserService.getCurrentStudent();

        List<AttendanceRecord> records =
                attendanceRepository.findByStudentIdOrderByAttendanceDateAscPeriodNumberAsc(
                        student.getId());

        Map<LocalDate, List<AttendanceRecord>> grouped = records.stream()
                .collect(Collectors.groupingBy(
                        AttendanceRecord::getAttendanceDate,
                        TreeMap::new,
                        Collectors.toList()));

        List<RegisterDayResponse> days = new ArrayList<>();

        grouped.forEach((date, items) -> {
            List<RegisterCellResponse> cells = items.stream()
                    .map(a -> new RegisterCellResponse(
                            a.getPeriodNumber(),
                            a.getSubject().getName(),
                            a.getStatus()))
                    .toList();

            days.add(new RegisterDayResponse(date, false, cells));
        });

        return new AcademicRegisterResponse(
                student.getRollNo(),
                student.getFullName(),
                Objects.toString(student.getSemester(), ""),
                days);
    }

    @Transactional(readOnly = true)
    public AttendanceReportResponse getAttendanceReport(
            String type,
            String month,
            LocalDate from,
            LocalDate to) {

        Student student = currentUserService.getCurrentStudent();

        LocalDate startDate = LocalDate.of(2000, 1, 1);
        LocalDate endDate = LocalDate.now();

        if ("monthly".equalsIgnoreCase(type) && month != null) {
            YearMonth ym = YearMonth.parse(month);
            startDate = ym.atDay(1);
            endDate = ym.atEndOfMonth();

        } else if ("period".equalsIgnoreCase(type)) {
            if (from != null) {
                startDate = from;
            }

            if (to != null) {
                endDate = to;
            }
        }

        // Find the class through the student's enrollment
        List<Enrollment> enrollments =
                enrollmentRepository.findByStudentId(student.getId());

        if (enrollments.isEmpty()) {
            throw new BadRequestException(
                    "No class enrollment found for this student.");
        }

        if (enrollments.size() > 1) {
            throw new BadRequestException(
                    "Multiple class enrollments found. Please verify the student's enrollment.");
        }

        UUID classId = enrollments.get(0).getCollegeClass().getId();

        // Fetch all subjects assigned to this class
        List<Subject> subjects =
                subjectRepository.findByCollegeClassId(classId);

        // Fetch attendance records for the selected date range
        List<AttendanceRecord> records =
                attendanceRepository.findByStudentIdAndAttendanceDateBetween(
                        student.getId(),
                        startDate,
                        endDate);

        // Group attendance records by subject ID
        Map<UUID, List<AttendanceRecord>> recordsBySubject =
                records.stream().collect(Collectors.groupingBy(
                        record -> record.getSubject().getId()));

        // Build rows for all subjects, including subjects with zero attendance
        List<AttendanceRowResponse> rows = subjects.stream()
                .sorted(Comparator.comparing(Subject::getName))
                .map(subject -> {

                    List<AttendanceRecord> subjectRecords =
                            recordsBySubject.getOrDefault(
                                    subject.getId(),
                                    Collections.emptyList());

                    long held = subjectRecords.size();

                    long attended = subjectRecords.stream()
                            .filter(record ->
                                    record.getStatus() == AttendanceStatus.PRESENT)
                            .count();

                    String code = Objects.toString(subject.getCode(), "");

                    String facultyName = subject.getFaculty() != null
                            ? subject.getFaculty().getFullName()
                            : "";

                    return new AttendanceRowResponse(
                            subject.getName(),
                            code,
                            facultyName,
                            held,
                            attended);
                })
                .toList();

        return new AttendanceReportResponse(
                student.getRollNo(),
                student.getFullName(),
                Objects.toString(student.getCourse(), ""),
                Objects.toString(student.getDepartment(), ""),
                Objects.toString(student.getSemester(), ""),
                rows);
    }
}
