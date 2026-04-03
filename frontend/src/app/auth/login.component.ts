import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { environment } from '../../environments/environment';
import { ApiResponse, AuthResponse } from '../shared/models/api.model';
import { AuthStoreService } from '../shared/services/auth-store.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <div class="login-shell">
      <div class="login-card">
        <div class="login-logo">
          <span class="logo-icon">🛡️</span>
          <h1>Rádce pojištění</h1>
          <p>Přihlaste se do svého účtu</p>
        </div>

        <form (ngSubmit)="onSubmit()" #f="ngForm">
          <div class="form-field">
            <label for="email">E-mail</label>
            <input
              id="email"
              type="email"
              name="email"
              [(ngModel)]="email"
              placeholder="vas@email.cz"
              required
              autocomplete="email"
            />
          </div>
          <div class="form-field">
            <label for="password">Heslo</label>
            <input
              id="password"
              type="password"
              name="password"
              [(ngModel)]="password"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
          </div>

          <div class="error-banner" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Přihlašování...' : 'Přihlásit se' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-shell {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0f4ff 0%, #e8f8f2 100%);
    }
    .login-card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(15,23,42,0.12);
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
    }
    .login-logo {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo-icon { font-size: 48px; }
    h1 { margin: 12px 0 4px; font-size: 22px; color: #1e293b; }
    p { color: #64748b; margin: 0; font-size: 14px; }
    .form-field { margin-bottom: 20px; }
    label { display: block; font-weight: 600; font-size: 13px; color: #374151; margin-bottom: 6px; }
    input {
      width: 100%; padding: 10px 14px; border: 1px solid #d1d5db;
      border-radius: 8px; font-size: 15px; outline: none; box-sizing: border-box;
      transition: border-color .2s;
    }
    input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
    .error-banner {
      background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626;
      border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 14px;
    }
    .btn-primary {
      width: 100%; padding: 12px; background: #6366f1; color: #fff;
      border: none; border-radius: 8px; font-size: 15px; font-weight: 600;
      cursor: pointer; transition: background .2s;
    }
    .btn-primary:hover:not(:disabled) { background: #4f46e5; }
    .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authStore: AuthStoreService
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiBaseUrl}/auth/login`,
      { email: this.email, password: this.password }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.authStore.save(res.data);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res.message ?? 'Přihlášení selhalo';
          this.loading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Neplatný e-mail nebo heslo';
        this.loading = false;
      }
    });
  }
}
