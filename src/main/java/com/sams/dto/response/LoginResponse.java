package com.sams.dto.response;

public record LoginResponse(
    String token,
    String role
) {}
