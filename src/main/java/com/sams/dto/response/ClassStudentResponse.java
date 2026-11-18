package com.sams.dto.response;

import java.util.UUID;

public record ClassStudentResponse(
    UUID studentId,
    String rollNo,
    String name
) {}
