package com.sams.controller;

import com.sams.dto.response.ClassInfoResponse;
import com.sams.dto.response.ClassStudentResponse;
import com.sams.dto.response.SavedMarkResponse;
import com.sams.service.AttendanceService;
import com.sams.service.ClassService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    private final ClassService classService;
    private final AttendanceService attendanceService;

    public ClassController(ClassService classService, AttendanceService attendanceService) {
        this.classService = classService;
        this.attendanceService = attendanceService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassInfoResponse> getClassInfo(@PathVariable String id) {
        return ResponseEntity.ok(classService.getClassInfo(id));
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<List<ClassStudentResponse>> getClassRoster(@PathVariable String id) {
        return ResponseEntity.ok(classService.getClassRoster(id));
    }

    @GetMapping("/{id}/attendance")
    public ResponseEntity<List<SavedMarkResponse>> getSavedAttendance(
        @PathVariable String id,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam int period
    ) {
        return ResponseEntity.ok(attendanceService.getSavedAttendance(id, date, period));
    }
}
