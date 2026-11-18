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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock private AttendanceRepository attendanceRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private SubjectRepository subjectRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private ClassService classService;
    @Mock private CurrentUserService currentUserService;

    private EntityDtoMapper mapper;
    private AttendanceService attendanceService;

    @BeforeEach
    void setUp() {
        mapper = new EntityDtoMapper();
        attendanceService = new AttendanceService(
            attendanceRepository,
            studentRepository,
            subjectRepository,
            enrollmentRepository,
            classService,
            mapper,
            currentUserService
        );
    }

    @Test
    void testFutureDateRejected() {
        CollegeClass c = new CollegeClass();
        c.setCode("ece-3a");
        Faculty f = new Faculty();

        when(currentUserService.getCurrentFaculty()).thenReturn(f);
        when(classService.resolveClass("ece-3a")).thenReturn(c);

        MarkAttendanceRequest req = new MarkAttendanceRequest(
            "ece-3a",
            LocalDate.now().plusDays(1),
            1,
            List.of(new MarkRecordRequest(UUID.randomUUID().toString(), AttendanceStatus.PRESENT))
        );

        assertThrows(BadRequestException.class, () -> attendanceService.markAttendance(req));
    }

    @Test
    void testMarkAttendanceSuccess() {
        CollegeClass c = new CollegeClass();
        UUID classId = UUID.randomUUID();
        c.setId(classId);
        c.setCode("ece-3a");

        Faculty f = new Faculty();
        UUID facId = UUID.randomUUID();
        f.setId(facId);

        Subject sub = new Subject();
        sub.setName("Signals & Systems");
        sub.setCollegeClass(c);
        sub.setFaculty(f);

        UUID studentId = UUID.randomUUID();
        Student s = new Student();
        s.setId(studentId);

        when(currentUserService.getCurrentFaculty()).thenReturn(f);
        when(classService.resolveClass("ece-3a")).thenReturn(c);
        when(subjectRepository.findFirstByCollegeClassIdAndFacultyId(classId, facId)).thenReturn(Optional.of(sub));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(s));
        when(enrollmentRepository.findByStudentIdAndCollegeClassId(studentId, classId))
            .thenReturn(Optional.of(new Enrollment(s, c)));
        when(attendanceRepository.findByCollegeClassIdAndAttendanceDateAndPeriodNumber(eq(classId), any(), eq(1)))
            .thenReturn(List.of());

        MarkAttendanceRequest req = new MarkAttendanceRequest(
            "ece-3a",
            LocalDate.now(),
            1,
            List.of(new MarkRecordRequest(studentId.toString(), AttendanceStatus.PRESENT))
        );

        assertDoesNotThrow(() -> attendanceService.markAttendance(req));
        verify(attendanceRepository).save(any(AttendanceRecord.class));
    }

    @Test
    void testGetSavedAttendance() {
        CollegeClass c = new CollegeClass();
        UUID classId = UUID.randomUUID();
        c.setId(classId);

        Student s = new Student();
        UUID sid = UUID.randomUUID();
        s.setId(sid);

        AttendanceRecord rec = new AttendanceRecord();
        rec.setStudent(s);
        rec.setStatus(AttendanceStatus.PRESENT);

        when(currentUserService.getCurrentFaculty()).thenReturn(new Faculty());
        when(classService.resolveClass("ece-3a")).thenReturn(c);
        when(attendanceRepository.findByCollegeClassIdAndAttendanceDateAndPeriodNumber(classId, LocalDate.of(2026, 11, 10), 1))
            .thenReturn(List.of(rec));

        List<SavedMarkResponse> marks = attendanceService.getSavedAttendance("ece-3a", LocalDate.of(2026, 11, 10), 1);
        assertEquals(1, marks.size());
        assertEquals(sid, marks.get(0).studentId());
        assertEquals(AttendanceStatus.PRESENT, marks.get(0).status());
    }
}
