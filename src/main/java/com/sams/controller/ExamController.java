package com.sams.controller;

import com.sams.dto.response.ExamSlotResponse;
import com.sams.service.ExamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping
    public ResponseEntity<List<ExamSlotResponse>> getMyExams() {
        return ResponseEntity.ok(examService.getStudentExams());
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<ExamSlotResponse>> getExamsByClass(@PathVariable String classId) {
        return ResponseEntity.ok(examService.getExamsByClass(classId));
    }
}
