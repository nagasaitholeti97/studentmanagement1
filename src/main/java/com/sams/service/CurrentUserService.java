package com.sams.service;

import com.sams.exception.ForbiddenException;
import com.sams.exception.UnauthorizedException;
import com.sams.model.Faculty;
import com.sams.model.Student;
import com.sams.model.UserAccount;
import com.sams.repository.FacultyRepository;
import com.sams.repository.StudentRepository;
import com.sams.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;

    public CurrentUserService(UserRepository userRepository, StudentRepository studentRepository, FacultyRepository facultyRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
    }

    public UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new UnauthorizedException("User is not authenticated");
        }
        try {
            return UUID.fromString(auth.getName());
        } catch (IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid authentication principal");
        }
    }

    public UserAccount getCurrentUser() {
        return userRepository.findById(getCurrentUserId())
            .orElseThrow(() -> new UnauthorizedException("User account not found"));
    }

    public Student getCurrentStudent() {
        return studentRepository.findByUserId(getCurrentUser().getId())
            .orElseThrow(() -> new ForbiddenException("Student account required"));
    }

    public Faculty getCurrentFaculty() {
        return facultyRepository.findByUserId(getCurrentUser().getId())
            .orElseThrow(() -> new ForbiddenException("Faculty account required"));
    }
}
