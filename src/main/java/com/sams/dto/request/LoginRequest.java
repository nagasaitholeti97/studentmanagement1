package com.sams.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Login identifier (email or roll number) is required")
    String identifier,

    @NotBlank(message = "Password is required")
    String password
) {}
