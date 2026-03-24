package com.insuranceadvisor.backend.health;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class HealthService {

  private final DataSource dataSource;

  public HealthService(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  public HealthResponse getHealth() {
    DependencyStatusResponse postgresStatus = checkPostgres();
    DependencyStatusResponse pgvectorStatus = checkPgvector();

    HealthStatus overall = deriveOverallStatus(postgresStatus.status(), pgvectorStatus.status());

    Map<String, DependencyStatusResponse> dependencies = new HashMap<>();
    dependencies.put("postgres", postgresStatus);
    dependencies.put("pgvector", pgvectorStatus);

    return new HealthResponse(
        overall,
        "insurance-advisor-backend",
        Instant.now(),
        dependencies
    );
  }

  private DependencyStatusResponse checkPostgres() {
    try (Connection connection = dataSource.getConnection();
         PreparedStatement statement = connection.prepareStatement("SELECT 1");
         ResultSet ignored = statement.executeQuery()) {
      return new DependencyStatusResponse(HealthStatus.HEALTHY, "PostgreSQL connection OK");
    } catch (Exception exception) {
      return new DependencyStatusResponse(HealthStatus.DOWN, "PostgreSQL unavailable: " + exception.getMessage());
    }
  }

  private DependencyStatusResponse checkPgvector() {
    try (Connection connection = dataSource.getConnection();
         PreparedStatement statement = connection.prepareStatement(
             "SELECT extversion FROM pg_extension WHERE extname = 'vector'"
         );
         ResultSet resultSet = statement.executeQuery()) {
      if (resultSet.next()) {
        return new DependencyStatusResponse(
            HealthStatus.HEALTHY,
            "pgvector available (version " + resultSet.getString(1) + ")"
        );
      }

      return new DependencyStatusResponse(HealthStatus.DEGRADED, "pgvector extension is not installed");
    } catch (Exception exception) {
      return new DependencyStatusResponse(HealthStatus.DOWN, "pgvector check failed: " + exception.getMessage());
    }
  }

  private HealthStatus deriveOverallStatus(HealthStatus postgres, HealthStatus pgvector) {
    if (postgres == HealthStatus.DOWN || pgvector == HealthStatus.DOWN) {
      return HealthStatus.DOWN;
    }

    if (postgres == HealthStatus.DEGRADED || pgvector == HealthStatus.DEGRADED) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }
}
