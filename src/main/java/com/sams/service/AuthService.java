
package com.sams.service;

import com.sams.dto.request.RegisterRequest;
import com.sams.dto.request.ChangePasswordRequest;
import com.sams.dto.request.ForgotPasswordRequest;
import com.sams.dto.request.LoginRequest;
import com.sams.dto.request.ResetPasswordRequest;
import com.sams.dto.request.SendOtpRequest;
import com.sams.dto.request.VerifyOtpRequest;
import com.sams.dto.response.LoginResponse;
import com.sams.exception.BadRequestException;
import com.sams.exception.UnauthorizedException;
import com.sams.model.Faculty;
import com.sams.model.PasswordResetToken;
import com.sams.model.Role;
import com.sams.model.Student;
import com.sams.model.UserAccount;
import com.sams.repository.FacultyRepository;
import com.sams.repository.ResetTokenRepository;
import com.sams.repository.StudentRepository;
import com.sams.repository.UserRepository;
import com.sams.security.JwtService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    @Value("${app.registration.faculty-code:}")
    private String facultyRegistrationCode;

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final ResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final CurrentUserService currentUserService;
    private final OtpService otpService;
    private final String frontendUrl;

    public AuthService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            ResetTokenRepository resetTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            CurrentUserService currentUserService,
            OtpService otpService,
            @Value("${app.frontend-url}") String frontendUrl) {

        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.currentUserService = currentUserService;
        this.otpService = otpService;
        this.frontendUrl = frontendUrl;
    }

    // LOGIN
    public LoginResponse login(LoginRequest request) {

        UserAccount user = userRepository
                .findByEmailIgnoreCase(request.identifier())
                .or(() -> userRepository.findByLoginIdIgnoreCase(request.identifier()))
                .orElseThrow(() ->
                        new UnauthorizedException(
                                "Invalid roll number / email or password."));

        if (!user.isEnabled()
                || !passwordEncoder.matches(
                        request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException(
                    "Invalid roll number / email or password.");
        }

        String token = jwtService.generate(
                user.getId(), user.getRole().name());

        return new LoginResponse(token, user.getRole().name());
    }

    // REGISTER STUDENT / FACULTY
    @Transactional
    public void register(RegisterRequest request) {

        if (userRepository.findByEmailIgnoreCase(request.email()).isPresent()) {
            throw new BadRequestException("Email is already registered.");
        }

        UserAccount user = new UserAccount();
        user.setEmail(request.email().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEnabled(true);
        user.setRole(request.role());

        if (request.role() == Role.STUDENT) {

            if (request.studentId() == null
                    || request.studentId().isBlank()) {
                throw new BadRequestException("Student ID is required.");
            }

            if (studentRepository.existsByRollNoIgnoreCase(request.studentId())) {
                throw new BadRequestException(
                        "Student ID is already registered.");
            }

            if (userRepository.findByLoginIdIgnoreCase(
                    request.studentId()).isPresent()) {
                throw new BadRequestException(
                        "Student ID is already registered.");
            }

            user.setLoginId(request.studentId().trim());
            userRepository.save(user);

            Student student = new Student();
            student.setUser(user);
            student.setRollNo(request.studentId().trim());
            student.setFullName(request.name().trim());

            student.setPersonalEmail(request.personalEmail());
            student.setPhone(request.phone());
            student.setGender(request.gender());
            student.setDateOfBirth(request.dateOfBirth());

            student.setFatherName(request.fatherName());
            student.setMotherName(request.motherName());
            student.setParentPhone(request.parentPhone());

            student.setAddress(request.address());
            student.setCity(request.city());
            student.setState(request.state());
            student.setPincode(request.pincode());

            student.setDepartment(request.department());
            student.setYearLabel(request.year());
            student.setSection(request.section());

            studentRepository.save(student);

        } else if (request.role() == Role.FACULTY) {

            if (facultyRegistrationCode == null
                    || facultyRegistrationCode.isBlank()) {
                throw new BadRequestException(
                        "Faculty registration is currently disabled.");
            }

            if (request.facultyCode() == null
                    || !facultyRegistrationCode.equals(
                            request.facultyCode())) {
                throw new BadRequestException(
                        "Invalid faculty registration code.");
            }

            if (request.facultyId() == null
                    || request.facultyId().isBlank()) {
                throw new BadRequestException("Faculty ID is required.");
            }

            if (facultyRepository.findByFacultyIdIgnoreCase(
                    request.facultyId()).isPresent()) {
                throw new BadRequestException(
                        "Faculty ID is already registered.");
            }

            if (userRepository.findByLoginIdIgnoreCase(
                    request.facultyId()).isPresent()) {
                throw new BadRequestException(
                        "Faculty ID is already registered.");
            }

            user.setLoginId(request.facultyId().trim());
            userRepository.save(user);

            Faculty faculty = new Faculty();
            faculty.setUser(user);
            faculty.setFacultyId(request.facultyId().trim());
            faculty.setFullName(request.name().trim());

            faculty.setPersonalEmail(
                    request.personalEmail() != null
                            && !request.personalEmail().isBlank()
                            ? request.personalEmail().trim()
                            : request.email().trim()
            );

            faculty.setPhone(request.phone());
            faculty.setGender(request.gender());

            faculty.setDepartment(request.department());
            faculty.setDesignation(request.designation());
            faculty.setQualification(request.qualification());
            faculty.setAge(request.age());
            faculty.setExperienceYears(request.experienceYears());

            facultyRepository.save(faculty);

        } else {
            throw new BadRequestException("Invalid registration role.");
        }
    }

    // CHANGE PASSWORD
    @Transactional
    public void changePassword(ChangePasswordRequest request) {

        UserAccount user = currentUserService.getCurrentUser();

        if (!passwordEncoder.matches(
                request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException(
                    "Current password is incorrect.");
        }

        user.setPasswordHash(
                passwordEncoder.encode(request.newPassword()));

        userRepository.save(user);
    }

    // LEGACY OTP METHODS - retained for compatibility
    public void sendOtp(SendOtpRequest request) {
        otpService.sendOtp(request.email());
    }

    public void verifyOtp(VerifyOtpRequest request) {
        otpService.verifyOtp(request.email(), request.otp());
    }

    // FORGOT PASSWORD - SEND SECURE RESET LINK
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {

        userRepository.findByEmailIgnoreCase(request.email())
                .or(() -> userRepository.findByLoginIdIgnoreCase(
                        request.email()))
                .ifPresent(user -> {

                    String personalEmail = null;

                    if (user.getRole() == Role.STUDENT) {
                        personalEmail = studentRepository
                                .findByUserId(user.getId())
                                .map(Student::getPersonalEmail)
                                .filter(e -> e != null && !e.isBlank())
                                .orElse(null);

                    } else if (user.getRole() == Role.FACULTY) {
                        personalEmail = facultyRepository
                                .findByUserId(user.getId())
                                .map(Faculty::getPersonalEmail)
                                .filter(e -> e != null && !e.isBlank())
                                .orElse(null);
                    }

                    if (personalEmail != null && !personalEmail.isBlank()) {

                        String rawToken = UUID.randomUUID()
                                + "-" + UUID.randomUUID();

                        PasswordResetToken token =
                                new PasswordResetToken();

                        token.setUser(user);
                        token.setTokenHash(
                                passwordEncoder.encode(rawToken));
                        token.setExpiresAt(
                                Instant.now().plusSeconds(1800));

                        resetTokenRepository.save(token);

                        try {
                            emailService.send(
                                    personalEmail,
                                    "SAMS Password Reset",
                                    "Reset your password within 30 minutes: "
                                            + frontendUrl
                                            + "/forgot-password?token="
                                            + rawToken);
                        } catch (Exception e) {
                            // Do not expose personal email or token in logs.
                        }
                    }
                });
    }

    // RESET PASSWORD USING EMAIL TOKEN
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        PasswordResetToken token = resetTokenRepository.findAll()
                .stream()
                .filter(t -> t.getUsedAt() == null
                        && t.getExpiresAt().isAfter(Instant.now())
                        && passwordEncoder.matches(
                                request.token(), t.getTokenHash()))
                .findFirst()
                .orElseThrow(() ->
                        new BadRequestException(
                                "Invalid or expired reset token."));

        UserAccount user = token.getUser();

        user.setPasswordHash(
                passwordEncoder.encode(request.newPassword()));

        userRepository.save(user);

        token.setUsedAt(Instant.now());
        resetTokenRepository.save(token);
    }
}
