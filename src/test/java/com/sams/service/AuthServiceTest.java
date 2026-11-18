
package com.sams.service;

import com.sams.dto.request.ChangePasswordRequest;
import com.sams.dto.request.ForgotPasswordRequest;
import com.sams.dto.request.LoginRequest;
import com.sams.dto.request.ResetPasswordRequest;
import com.sams.dto.request.SendOtpRequest;
import com.sams.dto.request.VerifyOtpRequest;
import com.sams.dto.response.LoginResponse;
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

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private FacultyRepository facultyRepository;
    @Mock private ResetTokenRepository resetTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private EmailService emailService;
    @Mock private CurrentUserService currentUserService;
    @Mock private OtpService otpService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                studentRepository,
                facultyRepository,
                resetTokenRepository,
                passwordEncoder,
                jwtService,
                emailService,
                currentUserService,
                otpService,
                "http://localhost:5173"
        );
    }

    // LOGIN SUCCESS
    @Test
    void testLoginSuccess() {
        UserAccount user = new UserAccount();
        user.setEmail("student@college.edu");
        user.setLoginId("22EC1024");
        user.setPasswordHash("hashed_pw");
        user.setRole(Role.STUDENT);
        user.setEnabled(true);

        when(userRepository.findByEmailIgnoreCase("student@college.edu"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("student123", "hashed_pw"))
                .thenReturn(true);
        when(jwtService.generate(any(), eq("STUDENT")))
                .thenReturn("mock_token");

        LoginResponse response = authService.login(
                new LoginRequest("student@college.edu", "student123"));

        assertNotNull(response);
        assertEquals("mock_token", response.token());
        assertEquals("STUDENT", response.role());
    }

    // INVALID LOGIN
    @Test
    void testLoginInvalidCredentials() {
        when(userRepository.findByEmailIgnoreCase("unknown@college.edu"))
                .thenReturn(Optional.empty());
        when(userRepository.findByLoginIdIgnoreCase("unknown@college.edu"))
                .thenReturn(Optional.empty());

        assertThrows(UnauthorizedException.class, () ->
                authService.login(
                        new LoginRequest("unknown@college.edu", "wrong")));
    }

    // CHANGE PASSWORD
    @Test
    void testChangePasswordSuccess() {
        UserAccount user = new UserAccount();
        user.setPasswordHash("old_hash");

        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(passwordEncoder.matches("old_pw", "old_hash")).thenReturn(true);
        when(passwordEncoder.encode("new_password_123"))
                .thenReturn("new_hash");

        authService.changePassword(
                new ChangePasswordRequest("old_pw", "new_password_123"));

        assertEquals("new_hash", user.getPasswordHash());
        verify(userRepository).save(user);
    }

    // LEGACY OTP SEND
    @Test
    void testSendOtpDelegatesToOtpService() {
        SendOtpRequest request =
                new SendOtpRequest("student@college.edu");

        authService.sendOtp(request);

        verify(otpService).sendOtp("student@college.edu");
    }

    // LEGACY OTP VERIFY
    @Test
    void testVerifyOtpDelegatesToOtpService() {
        VerifyOtpRequest request =
                new VerifyOtpRequest("student@college.edu", "123456");

        authService.verifyOtp(request);

        verify(otpService).verifyOtp(
                "student@college.edu", "123456");
    }

    // STUDENT FORGOT PASSWORD
    @Test
    void testStudentForgotPasswordDispatchesToPersonalEmail() {
        UUID userId = UUID.randomUUID();

        UserAccount user = new UserAccount();
        user.setId(userId);
        user.setEmail("ananya@college.edu");
        user.setRole(Role.STUDENT);

        Student student = new Student();
        student.setUser(user);
        student.setPersonalEmail("ananya.personal@gmail.com");

        when(userRepository.findByEmailIgnoreCase("ananya@college.edu"))
                .thenReturn(Optional.of(user));
        when(studentRepository.findByUserId(userId))
                .thenReturn(Optional.of(student));
        when(passwordEncoder.encode(any()))
                .thenReturn("hashed_token");

        authService.forgotPassword(
                new ForgotPasswordRequest("ananya@college.edu"));

        verify(emailService).send(
                eq("ananya.personal@gmail.com"),
                contains("Password Reset"),
                contains("/forgot-password?token=")
        );

        verify(resetTokenRepository).save(any(PasswordResetToken.class));
    }

    // FACULTY FORGOT PASSWORD
    @Test
    void testFacultyForgotPasswordDispatchesToPersonalEmail() {
        UUID userId = UUID.randomUUID();

        UserAccount user = new UserAccount();
        user.setId(userId);
        user.setEmail("suresh@college.edu");
        user.setRole(Role.FACULTY);

        Faculty faculty = new Faculty();
        faculty.setUser(user);
        faculty.setPersonalEmail("suresh.personal@gmail.com");

        when(userRepository.findByEmailIgnoreCase("suresh@college.edu"))
                .thenReturn(Optional.of(user));
        when(facultyRepository.findByUserId(userId))
                .thenReturn(Optional.of(faculty));
        when(passwordEncoder.encode(any()))
                .thenReturn("hashed_token");

        authService.forgotPassword(
                new ForgotPasswordRequest("suresh@college.edu"));

        verify(emailService).send(
                eq("suresh.personal@gmail.com"),
                contains("Password Reset"),
                contains("/forgot-password?token=")
        );

        verify(resetTokenRepository).save(any(PasswordResetToken.class));
    }

    // NO PERSONAL EMAIL
    @Test
    void testForgotPasswordWithNoPersonalEmailDoesNotDispatchEmail() {
        UUID userId = UUID.randomUUID();

        UserAccount user = new UserAccount();
        user.setId(userId);
        user.setEmail("nostudent@college.edu");
        user.setRole(Role.STUDENT);

        Student student = new Student();
        student.setUser(user);
        student.setPersonalEmail(null);

        when(userRepository.findByEmailIgnoreCase("nostudent@college.edu"))
                .thenReturn(Optional.of(user));
        when(studentRepository.findByUserId(userId))
                .thenReturn(Optional.of(student));

        authService.forgotPassword(
                new ForgotPasswordRequest("nostudent@college.edu"));

        verifyNoInteractions(emailService);
        verifyNoInteractions(resetTokenRepository);
    }

    // RESET PASSWORD SUCCESS
    @Test
    void testResetPasswordSuccessAndInvalidatesToken() {
        UserAccount user = new UserAccount();
        user.setPasswordHash("old_hash");

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash("hashed_raw_token");
        token.setExpiresAt(Instant.now().plusSeconds(1800));
        token.setUsedAt(null);

        when(resetTokenRepository.findAll())
                .thenReturn(List.of(token));
        when(passwordEncoder.matches(
                "raw_token_123", "hashed_raw_token"))
                .thenReturn(true);
        when(passwordEncoder.encode("brand_new_pass"))
                .thenReturn("brand_new_hash");

        authService.resetPassword(
                new ResetPasswordRequest(
                        "raw_token_123", "brand_new_pass"));

        assertEquals("brand_new_hash", user.getPasswordHash());
        assertNotNull(token.getUsedAt());

        verify(userRepository).save(user);
        verify(resetTokenRepository).save(token);
    }

    // RESET PASSWORD INVALID TOKEN
    @Test
    void testResetPasswordInvalidToken() {
        PasswordResetToken token = new PasswordResetToken();
        token.setTokenHash("some_hash");
        token.setExpiresAt(Instant.now().plusSeconds(1800));

        when(resetTokenRepository.findAll())
                .thenReturn(List.of(token));
        when(passwordEncoder.matches(any(), any()))
                .thenReturn(false);

        assertThrows(
                com.sams.exception.BadRequestException.class,
                () -> authService.resetPassword(
                        new ResetPasswordRequest(
                                "invalid_token", "newPassword123"))
        );
    }
}
