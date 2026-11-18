package com.sams.service;

import com.sams.dto.request.ContactUpdateRequest;
import com.sams.dto.response.ClassInfoResponse;
import com.sams.dto.response.FacultyProfileResponse;
import com.sams.dto.response.TeachingPeriodResponse;
import com.sams.exception.BadRequestException;
import com.sams.mapper.EntityDtoMapper;
import com.sams.model.CollegeClass;
import com.sams.model.Faculty;
import com.sams.model.Subject;
import com.sams.repository.AttendanceRepository;
import com.sams.repository.EnrollmentRepository;
import com.sams.repository.FacultyRepository;
import com.sams.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final ClassService classService;
    private final EntityDtoMapper mapper;
    private final CurrentUserService currentUserService;

    public FacultyService(FacultyRepository facultyRepository,
                          SubjectRepository subjectRepository,
                          EnrollmentRepository enrollmentRepository,
                          AttendanceRepository attendanceRepository,
                          ClassService classService,
                          EntityDtoMapper mapper,
                          CurrentUserService currentUserService) {
        this.facultyRepository = facultyRepository;
        this.subjectRepository = subjectRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.attendanceRepository = attendanceRepository;
        this.classService = classService;
        this.mapper = mapper;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public FacultyProfileResponse getFacultyProfile() {
        Faculty faculty = currentUserService.getCurrentFaculty();
        List<String> subjects = subjectRepository.findByFacultyId(faculty.getId()).stream()
            .map(Subject::getName)
            .distinct()
            .toList();
        return mapper.toFacultyProfile(faculty, subjects);
    }

    @Transactional
    public FacultyProfileResponse updateContact(ContactUpdateRequest request) {
        Faculty faculty = currentUserService.getCurrentFaculty();

        String newPersonalEmail = request.personalEmail() != null ? request.personalEmail().trim() : null;
        String currentPersonalEmail = faculty.getPersonalEmail() != null ? faculty.getPersonalEmail().trim() : "";

        if (newPersonalEmail != null && !newPersonalEmail.isEmpty() && !newPersonalEmail.equalsIgnoreCase(currentPersonalEmail)) {
            facultyRepository.findByPersonalEmailIgnoreCase(newPersonalEmail).ifPresent(existing -> {
                if (!existing.getId().equals(faculty.getId())) {
                    throw new BadRequestException("Personal email is already registered to another faculty account.");
                }
            });
        }

        faculty.setPhone(request.phone() != null ? request.phone().trim() : null);
        faculty.setPersonalEmail(newPersonalEmail);
        Faculty saved = facultyRepository.save(faculty);

        List<String> subjects = subjectRepository.findByFacultyId(saved.getId()).stream()
            .map(Subject::getName)
            .distinct()
            .toList();
        return mapper.toFacultyProfile(saved, subjects);
    }

    @Transactional(readOnly = true)
    public List<ClassInfoResponse> getMyClasses() {
        Faculty faculty = currentUserService.getCurrentFaculty();
        return subjectRepository.findByFacultyId(faculty.getId()).stream()
            .map(Subject::getCollegeClass)
            .distinct()
            .map(c -> {
                int studentCount = enrollmentRepository.findByCollegeClassId(c.getId()).size();
                String subjectName = subjectRepository.findByCollegeClassId(c.getId()).stream()
                    .map(Subject::getName).findFirst().orElse("");
                return mapper.toClassInfo(c, subjectName, studentCount, 0, 0);
            })
            .toList();
    }

    @Transactional(readOnly = true)
    public List<TeachingPeriodResponse> getPeriods(String classId, LocalDate date) {
        Faculty faculty = currentUserService.getCurrentFaculty();
        CollegeClass collegeClass = classService.resolveClass(classId);
        List<Subject> classSubjects = subjectRepository.findByCollegeClassId(collegeClass.getId());

        List<TeachingPeriodResponse> periods = new ArrayList<>();
        for (int p = 1; p <= 7; p++) {
            Subject sub = classSubjects.isEmpty() ? null : classSubjects.get((p - 1) % classSubjects.size());
            boolean saved = !attendanceRepository.findByCollegeClassIdAndAttendanceDateAndPeriodNumber(collegeClass.getId(), date, p).isEmpty();
            String subjectName = sub == null ? "Unassigned" : sub.getName();
            boolean own = sub != null && sub.getFaculty().getId().equals(faculty.getId());
            periods.add(new TeachingPeriodResponse(p, subjectName, own, saved));
        }
        return periods;
    }
}
