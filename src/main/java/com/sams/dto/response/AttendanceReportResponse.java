package com.sams.dto.response;

import java.util.List;

public record AttendanceReportResponse(
    String rollNo,
    String name,
    String program,
    String branch,
    String semester,
    List<AttendanceRowResponse> rows
) {}
