package com.sams.dto.response;

import java.time.LocalDate;
import java.util.List;

public record RegisterDayResponse(
    LocalDate date,
    boolean holiday,
    List<RegisterCellResponse> cells
) {}
