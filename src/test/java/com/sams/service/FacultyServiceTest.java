package com.sams.service;

import com.sams.dto.request.ContactUpdateRequest;
import com.sams.dto.response.FacultyProfileResponse;
import com.sams.dto.response.TeachingPeriodResponse;
import com.sams.mapper.EntityDtoMapper;
import com.sams.model.CollegeClass;
import com.sams.model.Faculty;
import com.sams.model.Subject;
import com.sams.model.UserAccount;
import com.sams.repository.AttendanceRepository;
import com.sams.repository.EnrollmentRepository;
import com.sams.repository.FacultyRepository;
import com.sams.repository.SubjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultyServiceTest {

    @Mock private FacultyRepository facultyRepository;
    @Mock private SubjectRepository subjectRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private AttendanceRepository attendanceRepository;
    @Mock private ClassService classService;
    @Mock private CurrentUserService currentUserService;

    private EntityDtoMapper mapper;
    private FacultyService facultyService;

    @BeforeEach
    void setUp() {
        mapper = new EntityDtoMapper();
        facultyService = new FacultyService(
            facultyRepository,
            subjectRepository,
            enrollmentRepository,
            attendanceRepository,
            classService,
            mapper,
            currentUserService
        );
    }

    @Test
    void testGetFacultyProfile() {
        UserAccount u = new UserAccount();
        u.setEmail("faculty@college.edu");

        Faculty f = new Faculty();
        UUID fid = UUID.randomUUID();
        f.setId(fid);
        f.setUser(u);
        f.setFullName("Dr. Suresh Kumar");
        f.setDepartment("ECE");

        when(currentUserService.getCurrentFaculty()).thenReturn(f);
        when(subjectRepository.findByFacultyId(fid)).thenReturn(List.of());

        FacultyProfileResponse res = facultyService.getFacultyProfile();
        assertNotNull(res);
        assertEquals("Dr. Suresh Kumar", res.name());
        assertEquals("faculty@college.edu", res.email());
    }

    @Test
    void testUpdateContact() {
        UserAccount u = new UserAccount();
        u.setEmail("faculty@college.edu");

        Faculty f = new Faculty();
        UUID fid = UUID.randomUUID();
        f.setId(fid);
        f.setUser(u);
        f.setFullName("Dr. Suresh Kumar");

        when(currentUserService.getCurrentFaculty()).thenReturn(f);
        when(facultyRepository.save(any(Faculty.class))).thenReturn(f);
        when(subjectRepository.findByFacultyId(fid)).thenReturn(List.of());

        FacultyProfileResponse res = facultyService.updateContact(new ContactUpdateRequest("+91 99999 11111", "new@example.com"));
        assertNotNull(res);
        verify(facultyRepository).save(f);
    }

    @Test
    void testGetPeriods() {
        Faculty f = new Faculty();
        UUID fid = UUID.randomUUID();
        f.setId(fid);

        CollegeClass c = new CollegeClass();
        UUID cid = UUID.randomUUID();
        c.setId(cid);
        c.setCode("ece-3a");

        Subject s = new Subject();
        s.setName("Signals & Systems");
        s.setFaculty(f);
        s.setCollegeClass(c);

        when(currentUserService.getCurrentFaculty()).thenReturn(f);
        when(classService.resolveClass("ece-3a")).thenReturn(c);
        when(subjectRepository.findByCollegeClassId(cid)).thenReturn(List.of(s));

        List<TeachingPeriodResponse> periods = facultyService.getPeriods("ece-3a", LocalDate.of(2026, 11, 10));
        assertEquals(7, periods.size());
        assertEquals("Signals & Systems", periods.get(0).subject());
        assertTrue(periods.get(0).own());
    }
}
