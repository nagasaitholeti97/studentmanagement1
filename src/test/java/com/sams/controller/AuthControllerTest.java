
package com.sams.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sams.dto.request.LoginRequest;
import com.sams.dto.request.ForgotPasswordRequest;
import com.sams.dto.request.ResetPasswordRequest;
import com.sams.dto.response.LoginResponse;
import com.sams.exception.GlobalExceptionHandler;
import com.sams.security.JwtAuthFilter;
import com.sams.security.JwtService;
import com.sams.service.AuthService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private JwtService jwtService;

    // LOGIN SUCCESS
    @Test
    void testLoginSuccess() throws Exception {

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(new LoginResponse("jwt_token_123", "STUDENT"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new LoginRequest("student@college.edu", "student123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt_token_123"))
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    // LOGIN VALIDATION FAILURE
    @Test
    void testLoginValidationFailure() throws Exception {

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new LoginRequest("", ""))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    // FORGOT PASSWORD - SEND RESET LINK
    @Test
    void testForgotPasswordSuccessReturns202() throws Exception {

        doNothing().when(authService)
                .forgotPassword(any(ForgotPasswordRequest.class));

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new ForgotPasswordRequest("student@college.edu"))))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").value(
                        "If an eligible account exists, a password reset link has been sent."));
    }

    // FORGOT PASSWORD - INVALID EMAIL
    @Test
    void testForgotPasswordInvalidEmailReturns400() throws Exception {

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new ForgotPasswordRequest("not-an-email"))))
                .andExpect(status().isBadRequest());
    }

    // RESET PASSWORD - VALID TOKEN
    @Test
    void testResetPasswordSuccessReturns200() throws Exception {

        doNothing().when(authService)
                .resetPassword(any(ResetPasswordRequest.class));

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new ResetPasswordRequest("valid-reset-token", "newPassword123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(
                        "Password reset successfully."));
    }

    // RESET PASSWORD - SHORT PASSWORD
    @Test
    void testResetPasswordShortPasswordReturns400() throws Exception {

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new ResetPasswordRequest("valid-reset-token", "short"))))
                .andExpect(status().isBadRequest());
    }

    // RESET PASSWORD - MISSING TOKEN
    @Test
    void testResetPasswordMissingTokenReturns400() throws Exception {

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new ResetPasswordRequest("", "newPassword123"))))
                .andExpect(status().isBadRequest());
    }
}
