
package com.sams.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sams.dto.request.ContactUpdateRequest;
import com.sams.dto.response.StudentProfileResponse;
import com.sams.exception.GlobalExceptionHandler;
import com.sams.security.JwtAuthFilter;
import com.sams.security.JwtService;
import com.sams.service.ExamService;
import com.sams.service.StudentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StudentController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StudentService studentService;

    @MockBean
    private ExamService examService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private JwtService jwtService;

    @Test
    void testGetStudentProfile() throws Exception {
        UUID sid = UUID.randomUUID();

        when(studentService.getStudentProfile()).thenReturn(
            new StudentProfileResponse(
                sid,
                "22EC1024",
                "Ananya Reddy",
                "student@college.edu",
                "ananya.personal@gmail.com",
                "+91 90000 10001",
                "Not specified",
                LocalDate.of(2003, 5, 20),
                "Father",
                "Mother",
                "ParentPhone",
                "Address",
                "City",
                "Telangana",
                "500001",
                "ECE",
                "B.Tech",
                "3rd Year",
                "5",
                "ECE-A"
            )
        );

        mockMvc.perform(get("/api/students/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.rollNo").value("22EC1024"))
            .andExpect(jsonPath("$.name").value("Ananya Reddy"))
            .andExpect(jsonPath("$.email").value("student@college.edu"))
            .andExpect(jsonPath("$.personalEmail").value("ananya.personal@gmail.com"))
            .andExpect(jsonPath("$.state").value("Telangana"));
    }

    @Test
    void testUpdateContact() throws Exception {
        UUID sid = UUID.randomUUID();

        when(studentService.updateContact(any())).thenReturn(
            new StudentProfileResponse(
                sid,
                "22EC1024",
                "Ananya Reddy",
                "student@college.edu",
                "updated@gmail.com",
                "+91 99999 88888",
                "Not specified",
                LocalDate.of(2003, 5, 20),
                "Father",
                "Mother",
                "ParentPhone",
                "Address",
                "City",
                "Telangana",
                "500001",
                "ECE",
                "B.Tech",
                "3rd Year",
                "5",
                "ECE-A"
            )
        );

        mockMvc.perform(put("/api/students/me/contact")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    new ContactUpdateRequest(
                        "+91 99999 88888",
                        "updated@gmail.com"
                    )
                )))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.personalEmail").value("updated@gmail.com"))
            .andExpect(jsonPath("$.phone").value("+91 99999 88888"));
    }
}
