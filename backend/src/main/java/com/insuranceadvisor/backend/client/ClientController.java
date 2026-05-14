package com.insuranceadvisor.backend.client;

import com.insuranceadvisor.backend.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clients")
public class ClientController {

  private final ClientRepository clientRepository;
  private final PasswordEncoder passwordEncoder;

  public ClientController(ClientRepository clientRepository, PasswordEncoder passwordEncoder) {
    this.clientRepository = clientRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<Client>>> list(Authentication auth) {
    Long advisorId = (Long) auth.getPrincipal();
    List<Client> clients = clientRepository.findAllByAdvisor(advisorId);
    // Don't expose password hashes — just indicate if password is set
    clients = clients.stream().map(c -> new Client(
        c.id(), c.advisorId(), c.firstName(), c.lastName(), c.email(),
        c.phone(), c.birthDate(), c.address(), c.notes(),
        c.username(), c.password() != null ? "__SET__" : null,
        c.createdAt(), c.updatedAt()
    )).toList();
    return ResponseEntity.ok(ApiResponse.ok(clients));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<Client>> get(@PathVariable Long id, Authentication auth) {
    Long advisorId = (Long) auth.getPrincipal();
    return clientRepository.findByIdAndAdvisor(id, advisorId)
        .map(c -> {
          Client safe = new Client(
              c.id(), c.advisorId(), c.firstName(), c.lastName(), c.email(),
              c.phone(), c.birthDate(), c.address(), c.notes(),
              c.username(), c.password() != null ? "__SET__" : null,
              c.createdAt(), c.updatedAt()
          );
          return ResponseEntity.ok(ApiResponse.ok(safe));
        })
        .orElse(ResponseEntity.status(404).body(ApiResponse.error("Client not found")));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<Client>> create(@RequestBody ClientRequest request, Authentication auth) {
    Long advisorId = (Long) auth.getPrincipal();
    ClientRequest hashed = hashPasswordIfNeeded(request);
    Client created = clientRepository.create(advisorId, hashed);
    return ResponseEntity.status(201).body(ApiResponse.ok("Client created", created));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<Client>> update(
      @PathVariable Long id,
      @RequestBody ClientRequest request,
      Authentication auth
  ) {
    Long advisorId = (Long) auth.getPrincipal();
    ClientRequest hashed = hashPasswordIfNeeded(request);
    return clientRepository.update(id, advisorId, hashed)
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

  private ClientRequest hashPasswordIfNeeded(ClientRequest request) {
    // Don't re-hash if already hashed or if it's the "keep existing" sentinel
    if (request.password() != null && !request.password().isEmpty()
        && !request.password().startsWith("$2b$") && !request.password().equals("__SET__")) {
      return new ClientRequest(
          request.firstName(), request.lastName(), request.email(),
          request.phone(), request.birthDate(), request.address(),
          request.notes(), request.username(),
          passwordEncoder.encode(request.password())
      );
    }
    return request;
  }
}
