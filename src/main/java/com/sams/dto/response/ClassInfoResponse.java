package com.sams.dto.response;

public record ClassInfoResponse(
    String id,
    String label,
    int year,
    String section,
    String subject,
    int studentCount,
    int average,
    int below75
) {}
