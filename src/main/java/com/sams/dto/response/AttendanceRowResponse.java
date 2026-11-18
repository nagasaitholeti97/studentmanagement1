package com.sams.dto.response;

public record AttendanceRowResponse(
    String subject,
    String code,
    String faculty,
    long held,
    long attended
) {}
