import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStoreService } from '../shared/services/auth-store.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <span>🛡️</span>
          <span class="logo-text">Rádce pojištění</span>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard/clients" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👥</span> Klienti
          </a>
          <a routerLink="/dashboard/files" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📁</span> Soubory
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <span class="user-avatar">{{ userInitials }}</span>
            <span class="user-name">{{ userName }}</span>
          </div>
          <button class="logout-btn" (click)="logout()">Odhlásit</button>
        </div>
      </aside>

      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; height: 100vh; overflow: hidden; }

    .sidebar {
      width: 240px; background: #1e293b; color: #e2e8f0;
      display: flex; flex-direction: column; flex-shrink: 0;
    }
    .sidebar-logo {
      padding: 24px 20px; font-size: 16px; font-weight: 700;
      border-bottom: 1px solid #334155; display: flex; align-items: center; gap: 10px;
    }
    .logo-text { color: #f8fafc; }

    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 8px; color: #94a3b8;
      text-decoration: none; font-size: 14px; font-weight: 500; transition: all .15s;
    }
    .nav-item:hover { background: #334155; color: #f1f5f9; }
    .nav-item.active { background: #6366f1; color: #fff; }
    .nav-icon { font-size: 16px; }

    .sidebar-footer { padding: 16px; border-top: 1px solid #334155; }
    .user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .user-avatar {
      width: 34px; height: 34px; border-radius: 50%; background: #6366f1;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .user-name { font-size: 13px; color: #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .logout-btn {
      width: 100%; padding: 8px; background: transparent; border: 1px solid #475569;
      color: #94a3b8; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all .15s;
    }
    .logout-btn:hover { background: #334155; color: #f1f5f9; }

    .main-content { flex: 1; overflow-y: auto; background: #f8fafc; }
  `]
})
export class DashboardComponent {
  userName = '';
  userInitials = '';

  constructor(private authStore: AuthStoreService, private router: Router) {
    const user = authStore.getUser();
    if (user) {
      this.userName = user.fullName;
      this.userInitials = user.fullName
        .split(' ')
        .map(p => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
  }

  logout(): void {
    this.authStore.clear();
    this.router.navigate(['/login']);
  }
}
