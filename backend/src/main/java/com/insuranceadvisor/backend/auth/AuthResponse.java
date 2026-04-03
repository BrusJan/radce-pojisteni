package com.insuranceadvisor.backend.auth;

public record AuthResponse(String token, Long userId, String email, String fullName) {}
