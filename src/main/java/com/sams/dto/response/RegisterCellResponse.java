package com.sams.dto.response;

import com.sams.model.AttendanceStatus;

public record RegisterCellResponse(
    int period,
    String subject,
    AttendanceStatus status
) {}
