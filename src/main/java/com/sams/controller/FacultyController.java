package com.sams.controller;

import com.sams.dto.request.ContactUpdateRequest;
import com.sams.dto.response.ClassInfoResponse;
import com.sams.dto.response.FacultyProfileResponse;
import com.sams.dto.response.TeachingPeriodResponse;
import com.sams.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping("/me")
    public ResponseEntity<FacultyProfileResponse> getFacultyProfile() {
        return ResponseEntity.ok(facultyService.getFacultyProfile());
    }

    @PutMapping("/me/contact")
    public ResponseEntity<FacultyProfileResponse> updateContact(@Valid @RequestBody ContactUpdateRequest request) {
        return ResponseEntity.ok(facultyService.updateContact(request));
    }

    @GetMapping("/me/classes")
    public ResponseEntity<List<ClassInfoResponse>> getMyClasses() {
        return ResponseEntity.ok(facultyService.getMyClasses());
    }

    @GetMapping("/me/classes/{id}/periods")
    public ResponseEntity<List<TeachingPeriodResponse>> getPeriods(
        @PathVariable String id,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(facultyService.getPeriods(id, date));
    }
}
