package com.insuranceadvisor.backend.file;

import java.time.Instant;

public record AdvisorFile(
    Long id,
    Long advisorId,
    String filename,
    String originalName,
    String mimeType,
    Long sizeBytes,
    boolean isPublic,
    Instant createdAt
) {}
