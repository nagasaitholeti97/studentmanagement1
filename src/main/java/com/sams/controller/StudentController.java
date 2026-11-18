
package com.sams.controller;

import com.sams.dto.request.ContactUpdateRequest;
import com.sams.dto.response.AcademicRegisterResponse;
import com.sams.dto.response.AttendanceReportResponse;
import com.sams.dto.response.ExamSlotResponse;
import com.sams.dto.response.StudentProfileResponse;
import com.sams.service.ExamService;
import com.sams.service.StudentService;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;
    private final ExamService examService;

    public StudentController(
            StudentService studentService,
            ExamService examService
    ) {
        this.studentService = studentService;
        this.examService = examService;
    }

    // Get logged-in student's profile
    @GetMapping("/me")
    public ResponseEntity<StudentProfileResponse> getStudentProfile() {
        return ResponseEntity.ok(
                studentService.getStudentProfile()
        );
    }

    // Update student's contact details
    @PutMapping("/me/contact")
    public ResponseEntity<StudentProfileResponse> updateContact(
            @Valid @RequestBody ContactUpdateRequest request
    ) {
        return ResponseEntity.ok(
                studentService.updateContact(request)
        );
    }

    // Get student's academic register
    @GetMapping("/me/register")
    public ResponseEntity<AcademicRegisterResponse> getRegister() {
        return ResponseEntity.ok(
                studentService.getRegister()
        );
    }

    // Get student's attendance report
    @GetMapping("/me/attendance-report")
    public ResponseEntity<AttendanceReportResponse> getAttendanceReport(
            @RequestParam(defaultValue = "till-now") String type,
            @RequestParam(required = false) String month,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {
        return ResponseEntity.ok(
                studentService.getAttendanceReport(type, month, from, to)
        );
    }

    // Get student's exam schedule
    @GetMapping("/me/exams")
    public ResponseEntity<List<ExamSlotResponse>> getStudentExams() {
        return ResponseEntity.ok(
                examService.getStudentExams()
        );
    }
}
