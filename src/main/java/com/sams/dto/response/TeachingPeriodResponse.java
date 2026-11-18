package com.sams.dto.response;

public record TeachingPeriodResponse(
    int period,
    String subject,
    boolean own,
    boolean saved
) {}
