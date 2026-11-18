
package com.sams.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record StudentProfileResponse(
    UUID studentId,
    String rollNo,
    String name,
    String email,
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
    String year,
    String semester,
    String section
) {}
