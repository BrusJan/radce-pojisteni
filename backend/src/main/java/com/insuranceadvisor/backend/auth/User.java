package com.insuranceadvisor.backend.auth;

import java.time.Instant;

public record User(
    Long id,
    String email,
    String password,
    String fullName,
    Instant createdAt
) {}
