
package com.sams.dto.request;

import com.sams.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegisterRequest(

    @NotBlank(message = "Full name is required")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must contain at least 8 characters")
    String password,

    @NotNull(message = "Role is required")
    Role role,

    String studentId,
    String facultyId,
    String department,
    String year,
    String section,
    String facultyCode,

    // Student personal details
    String gender,
    LocalDate dateOfBirth,
    String fatherName,
    String motherName,
    String parentPhone,
    String phone,
    String personalEmail,
    String address,
    String city,
    String state,
    String pincode,

    // Faculty professional and personal details
    String designation,
    String qualification,
    Integer age,
    Integer experienceYears

) {}
