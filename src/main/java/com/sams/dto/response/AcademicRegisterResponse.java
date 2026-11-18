package com.sams.dto.response;

import java.util.List;

public record AcademicRegisterResponse(
    String rollNo,
    String name,
    String semester,
    List<RegisterDayResponse> days
) {}
