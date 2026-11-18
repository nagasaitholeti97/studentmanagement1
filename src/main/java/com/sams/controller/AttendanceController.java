package com.sams.controller;

import com.sams.dto.request.MarkAttendanceRequest;
import com.sams.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    public ResponseEntity<Void> markAttendance(@Valid @RequestBody MarkAttendanceRequest request) {
        attendanceService.markAttendance(request);
        return ResponseEntity.noContent().build();
    }
}
