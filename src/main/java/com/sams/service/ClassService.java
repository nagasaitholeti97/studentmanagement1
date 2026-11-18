package com.sams.service;

import com.sams.dto.response.ClassInfoResponse;
import com.sams.dto.response.ClassStudentResponse;
import com.sams.exception.ResourceNotFoundException;
import com.sams.mapper.EntityDtoMapper;
import com.sams.model.CollegeClass;
import com.sams.model.Enrollment;
import com.sams.model.Subject;
import com.sams.repository.ClassRepository;
import com.sams.repository.EnrollmentRepository;
import com.sams.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ClassService {

    private final ClassRepository classRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SubjectRepository subjectRepository;
    private final EntityDtoMapper mapper;
    private final CurrentUserService currentUserService;

    public ClassService(ClassRepository classRepository,
                        EnrollmentRepository enrollmentRepository,
                        SubjectRepository subjectRepository,
                        EntityDtoMapper mapper,
                        CurrentUserService currentUserService) {
        this.classRepository = classRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.subjectRepository = subjectRepository;
        this.mapper = mapper;
        this.currentUserService = currentUserService;
    }

    public CollegeClass resolveClass(String codeOrId) {
        return classRepository.findByCode(codeOrId)
            .or(() -> {
                try {
                    return classRepository.findById(UUID.fromString(codeOrId));
                } catch (Exception e) {
                    return Optional.empty();
                }
            })
            .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
    }

    public ClassInfoResponse getClassInfo(String codeOrId) {
        currentUserService.getCurrentFaculty(); // Ensure faculty role
        CollegeClass collegeClass = resolveClass(codeOrId);
        List<Enrollment> enrollments = enrollmentRepository.findByCollegeClassId(collegeClass.getId());
        List<Subject> subjects = subjectRepository.findByCollegeClassId(collegeClass.getId());
        String subjectName = subjects.stream().map(Subject::getName).findFirst().orElse("");
        return mapper.toClassInfo(collegeClass, subjectName, enrollments.size(), 0, 0);
    }

    public List<ClassStudentResponse> getClassRoster(String codeOrId) {
        currentUserService.getCurrentFaculty(); // Ensure faculty role
        CollegeClass collegeClass = resolveClass(codeOrId);
        return enrollmentRepository.findByCollegeClassId(collegeClass.getId()).stream()
            .map(e -> mapper.toClassStudent(e.getStudent()))
            .toList();
    }
}
