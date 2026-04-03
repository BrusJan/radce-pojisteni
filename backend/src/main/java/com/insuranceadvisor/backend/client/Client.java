package com.insuranceadvisor.backend.client;

import java.time.Instant;
import java.time.LocalDate;

public record Client(
    Long id,
    Long advisorId,
    String firstName,
    String lastName,
    String email,
    String phone,
    LocalDate birthDate,
    String address,
    String notes,
    Instant createdAt,
    Instant updatedAt
) {}
