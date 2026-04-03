package com.insuranceadvisor.backend.client;

import java.time.LocalDate;

public record ClientRequest(
    String firstName,
    String lastName,
    String email,
    String phone,
    LocalDate birthDate,
    String address,
    String notes
) {}
