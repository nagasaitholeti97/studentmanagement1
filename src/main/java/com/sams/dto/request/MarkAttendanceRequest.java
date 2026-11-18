package com.sams.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record MarkAttendanceRequest(
    @NotBlank(message = "Class ID is required")
    String classId,

    @NotNull(message = "Attendance date is required")
    LocalDate date,

    @Min(value = 1, message = "Period must be between 1 and 7")
    @Max(value = 7, message = "Period must be between 1 and 7")
    int period,

    @NotEmpty(message = "Attendance records cannot be empty")
    @Valid
    List<MarkRecordRequest> records
) {}
