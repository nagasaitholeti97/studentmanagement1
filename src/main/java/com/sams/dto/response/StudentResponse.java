package com.sams.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record StudentResponse(
    UUID id,
    String rollNo,
    String fullName,
    String personalEmail,
    String phone,
    String gender,
    LocalDate dateOfBirth,
    String fatherName,
    String motherName,
    String parentPhone,
    String address,
    String city,
    String state,
    String pincode,
    String department,
    String course,
    String yearLabel,
    String semester,
    String section
) {}