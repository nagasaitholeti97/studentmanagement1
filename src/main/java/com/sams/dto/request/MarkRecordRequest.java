package com.sams.dto.request;

import com.sams.model.AttendanceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MarkRecordRequest(
    @NotBlank(message = "Student ID is required")
    String studentId,

    @NotNull(message = "Attendance status is required")
    AttendanceStatus status
) {}
