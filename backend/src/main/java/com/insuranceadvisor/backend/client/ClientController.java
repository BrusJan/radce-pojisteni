package com.insuranceadvisor.backend.client;

import com.insuranceadvisor.backend.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clients")
public class ClientController {

  private final ClientRepository clientRepository;

  public ClientController(ClientRepository clientRepository) {
    this.clientRepository = clientRepository;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<Client>>> list(Authentication auth) {
    Long advisorId = (Long) auth.getPrincipal();
    return ResponseEntity.ok(ApiResponse.ok(clientRepository.findAllByAdvisor(advisorId)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<Client>> get(@PathVariable Long id, Authentication auth) {
    Long advisorId = (Long) auth.getPrincipal();
    return clientRepository.findByIdAndAdvisor(id, advisorId)
        .map(c -> ResponseEntity.ok(ApiResponse.ok(c)))
        .orElse(ResponseEntity.status(404).body(ApiResponse.error("Client not found")));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<Client>> create(@RequestBody ClientRequest request, Authentication auth) {
    Long advisorId = (Long) auth.getPrincipal();
    Client created = clientRepository.create(advisorId, request);
    return ResponseEntity.status(201).body(ApiResponse.ok("Client created", created));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<Client>> update(
      @PathVariable Long id,
      @RequestBody ClientRequest request,
      Authentication auth
  ) {
    Long advisorId = (Long) auth.getPrincipal();
    return clientRepository.update(id, advisorId, request)
        .map(c -> ResponseEntity.ok(ApiResponse.ok("Client updated", c)))
        .orElse(ResponseEntity.status(404).body(ApiResponse.error("Client not found")));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, Authentication auth) {
    Long advisorId = (Long) auth.getPrincipal();
    if (clientRepository.delete(id, advisorId)) {
      return ResponseEntity.ok(ApiResponse.ok("Client deleted", null));
    }
    return ResponseEntity.status(404).body(ApiResponse.error("Client not found"));
  }
}
