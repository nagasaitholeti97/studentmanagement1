package com.sams.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record ExamSlotResponse(
    UUID id,
    String type,
    String subject,
    String code,
    LocalDate date
) {}
