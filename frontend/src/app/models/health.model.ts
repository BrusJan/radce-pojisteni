export interface DependencyHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  detail: string;
}

export interface HealthResponse {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  service: string;
  timestamp: string;
  dependencies: {
    postgres: DependencyHealth;
    pgvector: DependencyHealth;
  };
}
