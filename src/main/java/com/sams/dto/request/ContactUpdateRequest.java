package com.sams.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContactUpdateRequest(
    @NotBlank(message = "Phone number is required")
    String phone,

    @NotBlank(message = "Personal email is required")
    @Email(message = "Invalid email format")
    String personalEmail
) {}
