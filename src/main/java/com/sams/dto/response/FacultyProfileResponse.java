package com.sams.dto.response;

import java.util.List;
import java.util.UUID;

public record FacultyProfileResponse(
    UUID facultyId,
    String name,
    String designation,
    String department,
    String email,
    String personalEmail,
    String phone,
    String gender,
    Integer age,
    String qualification,
    Integer experienceYears,
    List<String> subjects
) {}
