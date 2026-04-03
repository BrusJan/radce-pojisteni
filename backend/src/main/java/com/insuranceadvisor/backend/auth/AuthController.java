package com.insuranceadvisor.backend.auth;

import com.insuranceadvisor.backend.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest request) {
    try {
      AuthResponse response = authService.login(request);
      return ResponseEntity.ok(ApiResponse.ok(response));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage()));
    }
  }
}
