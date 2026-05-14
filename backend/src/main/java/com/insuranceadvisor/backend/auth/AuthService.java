package com.insuranceadvisor.backend.auth;

import com.insuranceadvisor.backend.client.Client;
import com.insuranceadvisor.backend.client.ClientRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final ClientRepository clientRepository;
  private final JwtService jwtService;
  private final PasswordEncoder passwordEncoder;

  public AuthService(UserRepository userRepository, ClientRepository clientRepository,
                     JwtService jwtService, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.clientRepository = clientRepository;
    this.jwtService = jwtService;
    this.passwordEncoder = passwordEncoder;
  }

  public AuthResponse loginAdvisor(AuthRequest request) {
    User user = userRepository.findByEmail(request.email())
        .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

    if (!passwordEncoder.matches(request.password(), user.password())) {
      throw new IllegalArgumentException("Invalid email or password");
    }

    String token = jwtService.generateAdvisor(user.id(), user.email());
    return new AuthResponse(token, user.id(), user.email(), user.fullName(), "ADVISOR");
  }

  public AuthResponse loginClient(AuthRequest request) {
    Client client = clientRepository.findByUsername(request.email())
        .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

    if (client.password() == null || !passwordEncoder.matches(request.password(), client.password())) {
      throw new IllegalArgumentException("Invalid username or password");
    }

    String token = jwtService.generateClient(client.id(), client.username());
    String fullName = client.firstName() + " " + client.lastName();
    return new AuthResponse(token, client.id(), client.username(), fullName, "CLIENT");
  }
}
