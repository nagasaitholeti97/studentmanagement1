
package com.sams.service;

import com.sams.dto.request.ContactUpdateRequest;
import com.sams.dto.response.StudentProfileResponse;
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

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private CurrentUserService currentUserService;

    private EntityDtoMapper mapper;
    private StudentService studentService;

    @BeforeEach
    void setUp() {
        mapper = new EntityDtoMapper();

        studentService = new StudentService(
                attendanceRepository,
                studentRepository,
                enrollmentRepository,
                subjectRepository,
                mapper,
                currentUserService
        );
    }

    @Test
    void testGetStudentProfile() {
        UserAccount user = new UserAccount();
        user.setEmail("student@college.edu");

        Student s = new Student();
        s.setUser(user);
        s.setRollNo("22EC1024");
        s.setFullName("Ananya Reddy");
        s.setPersonalEmail("ananya@gmail.com");
        s.setCourse("B.Tech");
        s.setDepartment("ECE");
        s.setSemester("5");

        when(currentUserService.getCurrentStudent()).thenReturn(s);

        StudentProfileResponse res = studentService.getStudentProfile();

        assertNotNull(res);
        assertEquals("22EC1024", res.rollNo());
        assertEquals("Ananya Reddy", res.name());
        assertEquals("student@college.edu", res.email());
        assertEquals("ananya@gmail.com", res.personalEmail());
    }

    @Test
    void testUpdateContactSuccess() {
        UUID sid = UUID.randomUUID();

        UserAccount user = new UserAccount();
        user.setEmail("student@college.edu");

        Student s = new Student();
        s.setId(sid);
        s.setUser(user);
        s.setRollNo("22EC1024");
        s.setFullName("Ananya Reddy");
        s.setPersonalEmail("old@gmail.com");
        s.setPhone("+91 90000 11111");

        when(currentUserService.getCurrentStudent()).thenReturn(s);

        when(studentRepository.findByPersonalEmailIgnoreCase("new@gmail.com"))
                .thenReturn(Optional.empty());

        when(studentRepository.save(any(Student.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        StudentProfileResponse res = studentService.updateContact(
                new ContactUpdateRequest(
                        "+91 99999 22222",
                        "new@gmail.com"
                )
        );

        assertNotNull(res);
        assertEquals("+91 99999 22222", res.phone());
        assertEquals("new@gmail.com", res.personalEmail());
    }

    @Test
    void testUpdateContactDuplicatePersonalEmailFails() {
        UUID sid = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();

        Student current = new Student();
        current.setId(sid);
        current.setPersonalEmail("old@gmail.com");

        Student other = new Student();
        other.setId(otherId);
        other.setPersonalEmail("taken@gmail.com");

        when(currentUserService.getCurrentStudent()).thenReturn(current);

        when(studentRepository.findByPersonalEmailIgnoreCase("taken@gmail.com"))
                .thenReturn(Optional.of(other));

        assertThrows(BadRequestException.class, () ->
                studentService.updateContact(
                        new ContactUpdateRequest(
                                "+91 90000 11111",
                                "taken@gmail.com"
                        )
                )
        );
    }
}
