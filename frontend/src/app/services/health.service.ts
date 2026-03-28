import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, switchMap, timer } from 'rxjs';
import { HealthResponse } from '../models/health.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HealthService {
  constructor(private readonly httpClient: HttpClient) {}

  private readonly fallbackHealth: HealthResponse = {
    status: 'DOWN',
    service: 'backend',
    timestamp: new Date().toISOString(),
    dependencies: {
      postgres: {
        status: 'DOWN',
        detail: 'Backend is unreachable from frontend'
      },
      pgvector: {
        status: 'DOWN',
        detail: 'Backend is unreachable from frontend'
      }
    }
  };

  pollHealth(intervalMs = 10000): Observable<HealthResponse> {
    return timer(0, intervalMs).pipe(switchMap(() => this.getHealth()));
  }

  private getHealth(): Observable<HealthResponse> {
    return this.httpClient
      .get<HealthResponse>(`${environment.apiBaseUrl}/health`)
      .pipe(
        catchError(() =>
          of({
            ...this.fallbackHealth,
            timestamp: new Date().toISOString()
          } as HealthResponse)
        )
      );
  }
}
