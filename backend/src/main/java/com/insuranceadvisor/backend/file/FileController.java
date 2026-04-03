package com.insuranceadvisor.backend.file;

import com.insuranceadvisor.backend.common.ApiResponse;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/files")
public class FileController {

  private final FileService fileService;
  private final FileRepository fileRepository;

  public FileController(FileService fileService, FileRepository fileRepository) {
    this.fileService = fileService;
    this.fileRepository = fileRepository;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<AdvisorFile>>> list(Authentication auth) {
    Long advisorId = (Long) auth.getPrincipal();
    return ResponseEntity.ok(ApiResponse.ok(fileRepository.findAllByAdvisor(advisorId)));
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ApiResponse<AdvisorFile>> upload(
      @RequestParam("file") MultipartFile file,
      Authentication auth
  ) throws IOException {
    Long advisorId = (Long) auth.getPrincipal();
    AdvisorFile saved = fileService.upload(advisorId, file);
    return ResponseEntity.status(201).body(ApiResponse.ok("File uploaded", saved));
  }

  @PatchMapping("/{id}/public")
  public ResponseEntity<ApiResponse<AdvisorFile>> setPublic(
      @PathVariable Long id,
      @RequestBody PublicFlagRequest request,
      Authentication auth
  ) {
    Long advisorId = (Long) auth.getPrincipal();
    return fileRepository.setPublic(id, advisorId, request.isPublic())
        .map(f -> ResponseEntity.ok(ApiResponse.ok("Updated", f)))
        .orElse(ResponseEntity.status(404).body(ApiResponse.error("File not found")));
  }

  @GetMapping("/{id}/download")
  public ResponseEntity<Resource> download(@PathVariable Long id, Authentication auth) throws MalformedURLException {
    Long advisorId = (Long) auth.getPrincipal();
    AdvisorFile advisorFile = fileRepository.findByIdAndAdvisor(id, advisorId)
        .orElse(null);
    if (advisorFile == null) {
      return ResponseEntity.notFound().build();
    }

    Path path = fileService.resolveStoredFile(advisorFile.filename());
    Resource resource = new UrlResource(path.toUri());
    if (!resource.exists()) {
      return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + advisorFile.originalName() + "\"")
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .body(resource);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, Authentication auth) {
    Long advisorId = (Long) auth.getPrincipal();
    AdvisorFile file = fileRepository.findByIdAndAdvisor(id, advisorId).orElse(null);
    if (file == null) {
      return ResponseEntity.status(404).body(ApiResponse.error("File not found"));
    }
    fileService.deleteStoredFile(file.filename());
    fileRepository.delete(id, advisorId);
    return ResponseEntity.ok(ApiResponse.ok("File deleted", null));
  }
}
