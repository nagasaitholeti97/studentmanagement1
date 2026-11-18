package com.sams.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record CalendarEventResponse(
    UUID id,
    String title,
    String type,
    LocalDate start,
    LocalDate end
) {}
