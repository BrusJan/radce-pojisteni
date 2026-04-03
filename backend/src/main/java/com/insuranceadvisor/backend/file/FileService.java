package com.insuranceadvisor.backend.file;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileService {

  private final FileRepository fileRepository;
  private final Path uploadDir;

  public FileService(
      FileRepository fileRepository,
      @Value("${app.upload.dir}") String uploadDir
  ) throws IOException {
    this.fileRepository = fileRepository;
    this.uploadDir = Paths.get(uploadDir);
    Files.createDirectories(this.uploadDir);
  }

  public AdvisorFile upload(Long advisorId, MultipartFile file) throws IOException {
    String extension = "";
    String originalName = file.getOriginalFilename();
    if (originalName != null && originalName.contains(".")) {
      extension = originalName.substring(originalName.lastIndexOf("."));
    }
    String storedName = UUID.randomUUID() + extension;
    Path target = uploadDir.resolve(storedName);
    file.transferTo(target);

    return fileRepository.save(
        advisorId,
        storedName,
        originalName,
        file.getContentType(),
        file.getSize()
    );
  }

  public Path resolveStoredFile(String filename) {
    return uploadDir.resolve(filename);
  }

  public void deleteStoredFile(String filename) {
    try {
      Files.deleteIfExists(uploadDir.resolve(filename));
    } catch (IOException ignored) {}
  }
}
