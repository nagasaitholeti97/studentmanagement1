package com.sams.service;

import com.sams.dto.response.ExamSlotResponse;
import com.sams.mapper.EntityDtoMapper;
import com.sams.model.CollegeClass;
import com.sams.model.ExamSlot;
import com.sams.model.Student;
import com.sams.repository.EnrollmentRepository;
import com.sams.repository.ExamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ExamService {

    private final ExamRepository examRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ClassService classService;
    private final EntityDtoMapper mapper;
    private final CurrentUserService currentUserService;

    public ExamService(ExamRepository examRepository,
                       EnrollmentRepository enrollmentRepository,
                       ClassService classService,
                       EntityDtoMapper mapper,
                       CurrentUserService currentUserService) {
        this.examRepository = examRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.classService = classService;
        this.mapper = mapper;
        this.currentUserService = currentUserService;
    }

    public List<ExamSlotResponse> getStudentExams() {
        Student student = currentUserService.getCurrentStudent();
        Set<UUID> classIds = enrollmentRepository.findAll().stream()
            .filter(e -> e.getStudent().getId().equals(student.getId()))
            .map(e -> e.getCollegeClass().getId())
            .collect(Collectors.toSet());

        return examRepository.findAll().stream()
            .filter(e -> classIds.contains(e.getCollegeClass().getId()))
            .sorted(Comparator.comparing(ExamSlot::getExamDate))
            .map(mapper::toExamSlot)
            .toList();
    }

    public List<ExamSlotResponse> getExamsByClass(String classId) {
        CollegeClass collegeClass = classService.resolveClass(classId);
        return examRepository.findByCollegeClassIdOrderByExamDateAsc(collegeClass.getId()).stream()
            .map(mapper::toExamSlot)
            .toList();
    }
}
