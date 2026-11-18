
package com.sams.controller;

import com.sams.dto.request.RegisterRequest;
import com.sams.dto.request.ChangePasswordRequest;
import com.sams.dto.request.ForgotPasswordRequest;
import com.sams.dto.request.LoginRequest;
import com.sams.dto.request.ResetPasswordRequest;
import com.sams.dto.response.LoginResponse;
import com.sams.dto.response.MessageResponse;
import com.sams.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // LOGIN - Student and Faculty
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    // REGISTRATION - Student and Faculty
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new MessageResponse("Registration successful."));
    }

    // CHANGE PASSWORD - Logged-in users
    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        authService.changePassword(request);

        return ResponseEntity.noContent().build();
    }

    // FORGOT PASSWORD - Send secure reset link to registered email
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        authService.forgotPassword(request);

        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(new MessageResponse(
                        "If an eligible account exists, a password reset link has been sent."
                ));
    }

    // RESET PASSWORD - Verify token and update password
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);

        return ResponseEntity.ok(
                new MessageResponse("Password reset successfully.")
        );
    }
}
