import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStoreService } from '../shared/services/auth-store.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  template: `
    <div class="client-shell">
      <header class="client-header">
        <div class="header-brand">
          <span>🛡️</span>
          <span class="brand-text">Rádce pojištění</span>
        </div>
        <div class="header-user">
          <span class="user-name">{{ userName }}</span>
          <button class="logout-btn" (click)="logout()">Odhlásit</button>
        </div>
      </header>

      <main class="client-content">
        <div class="empty-card">
          <span class="empty-icon">🏠</span>
          <h2>Vítejte v klientském portálu</h2>
          <p>Zatím zde není žádný obsah. Brzy zde najdete přehled vašich pojištění a dokumentů.</p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .client-shell { min-height: 100vh; background: #f8fafc; }

    .client-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 32px; background: #1e293b; color: #e2e8f0;
    }
    .header-brand { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; }
    .brand-text { color: #f8fafc; }

    .header-user { display: flex; align-items: center; gap: 16px; }
    .user-name { font-size: 14px; color: #cbd5e1; }
    .logout-btn {
      padding: 8px 16px; background: transparent; border: 1px solid #475569;
      color: #94a3b8; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all .15s;
    }
    .logout-btn:hover { background: #334155; color: #f1f5f9; }

    .client-content { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 72px); padding: 32px; }

    .empty-card {
      background: #fff; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.08);
      padding: 64px 48px; text-align: center; max-width: 480px; width: 100%;
    }
    .empty-icon { font-size: 56px; display: block; margin-bottom: 16px; }
    h2 { margin: 0 0 12px; font-size: 22px; color: #1e293b; }
    p { margin: 0; color: #64748b; font-size: 15px; line-height: 1.6; }
  `]
})
export class ClientDashboardComponent {
  userName = '';

  constructor(private authStore: AuthStoreService, private router: Router) {
    const user = authStore.getUser();
    if (user) {
      this.userName = user.fullName;
    }
  }

  logout(): void {
    this.authStore.clear();
    this.router.navigate(['/login']);
  }
}
