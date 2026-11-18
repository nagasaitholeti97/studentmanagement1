package com.sams.dto.response;

import com.sams.model.AttendanceStatus;
import java.util.UUID;

public record SavedMarkResponse(
    UUID studentId,
    AttendanceStatus status
) {}
