import { AsyncPipe, DatePipe, NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { HealthResponse } from './models/health.model';
import { HealthService } from './services/health.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgClass, NgIf, AsyncPipe, DatePipe],
  template: `
    <div class="page-shell">
      <section class="panel" *ngIf="health$ | async as health">
        <div class="status-bar" [ngClass]="statusClass(health.status)">
          <span class="dot" aria-hidden="true"></span>
          <strong>{{ statusLabel(health.status) }}</strong>
        </div>

        <h1>Stav systému</h1>
        <small>Automatická kontrola každých 10 sekund.</small>

        <div class="key-value">
          <label>Aplikace:</label>
          <span>{{ health.service }} ({{ health.status }})</span>

          <label>PostgreSQL:</label>
          <span>{{ health.dependencies.postgres.status }} - {{ health.dependencies.postgres.detail }}</span>

          <label>pgvector:</label>
          <span>{{ health.dependencies.pgvector.status }} - {{ health.dependencies.pgvector.detail }}</span>

          <label>Naposledy ověřeno:</label>
          <span>{{ health.timestamp | date: 'dd.MM.yyyy HH:mm:ss' }}</span>
        </div>
      </section>
    </div>
  `
})
export class AppComponent {
  readonly health$: Observable<HealthResponse>;

  constructor(healthService: HealthService) {
    this.health$ = healthService.pollHealth(10000);
  }

  statusClass(status: HealthResponse['status']): string {
    if (status === 'HEALTHY') {
      return 'status-healthy';
    }

    if (status === 'DEGRADED') {
      return 'status-degraded';
    }

    return 'status-down';
  }

  statusLabel(status: HealthResponse['status']): string {
    if (status === 'HEALTHY') {
      return 'Systém je v pořádku';
    }

    if (status === 'DEGRADED') {
      return 'Systém má omezení';
    }

    return 'Systém je nedostupný';
  }
}
