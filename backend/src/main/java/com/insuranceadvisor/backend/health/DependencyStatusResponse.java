package com.insuranceadvisor.backend.health;

public record DependencyStatusResponse(
    HealthStatus status,
    String detail
) {
}
