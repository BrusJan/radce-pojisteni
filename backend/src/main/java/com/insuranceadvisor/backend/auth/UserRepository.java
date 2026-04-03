package com.insuranceadvisor.backend.auth;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserRepository {

  private final JdbcTemplate jdbc;

  private final RowMapper<User> rowMapper = (rs, rowNum) -> new User(
      rs.getLong("id"),
      rs.getString("email"),
      rs.getString("password"),
      rs.getString("full_name"),
      rs.getTimestamp("created_at").toInstant()
  );

  public UserRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public Optional<User> findByEmail(String email) {
    var rows = jdbc.query(
        "SELECT id, email, password, full_name, created_at FROM users WHERE email = ?",
        rowMapper, email
    );
    return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
  }

  public Optional<User> findById(Long id) {
    var rows = jdbc.query(
        "SELECT id, email, password, full_name, created_at FROM users WHERE id = ?",
        rowMapper, id
    );
    return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
  }
}
