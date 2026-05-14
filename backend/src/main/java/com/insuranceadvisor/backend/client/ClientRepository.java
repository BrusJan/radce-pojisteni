package com.insuranceadvisor.backend.client;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class ClientRepository {

  private final JdbcTemplate jdbc;

  private final RowMapper<Client> rowMapper = (rs, rowNum) -> {
    Date bd = rs.getDate("birth_date");
    return new Client(
        rs.getLong("id"),
        rs.getLong("advisor_id"),
        rs.getString("first_name"),
        rs.getString("last_name"),
        rs.getString("email"),
        rs.getString("phone"),
        bd != null ? bd.toLocalDate() : null,
        rs.getString("address"),
        rs.getString("notes"),
        rs.getString("username"),
        rs.getString("password"),
        rs.getTimestamp("created_at").toInstant(),
        rs.getTimestamp("updated_at").toInstant()
    );
  };

  public ClientRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public List<Client> findAllByAdvisor(Long advisorId) {
    return jdbc.query(
        "SELECT * FROM clients WHERE advisor_id = ? ORDER BY last_name, first_name",
        rowMapper, advisorId
    );
  }

  public Optional<Client> findByIdAndAdvisor(Long id, Long advisorId) {
    var rows = jdbc.query(
        "SELECT * FROM clients WHERE id = ? AND advisor_id = ?",
        rowMapper, id, advisorId
    );
    return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
  }

  public Optional<Client> findByUsername(String username) {
    var rows = jdbc.query(
        "SELECT * FROM clients WHERE username = ?",
        rowMapper, username
    );
    return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
  }

  public Client create(Long advisorId, ClientRequest req) {
    var keyHolder = new GeneratedKeyHolder();
    jdbc.update(con -> {
      PreparedStatement ps = con.prepareStatement(
          "INSERT INTO clients (advisor_id, first_name, last_name, email, phone, birth_date, address, notes, username, password) " +
          "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          Statement.RETURN_GENERATED_KEYS
      );
      ps.setLong(1, advisorId);
      ps.setString(2, req.firstName());
      ps.setString(3, req.lastName());
      ps.setString(4, req.email());
      ps.setString(5, req.phone());
      ps.setObject(6, req.birthDate());
      ps.setString(7, req.address());
      ps.setString(8, req.notes());
      ps.setString(9, req.username());
      ps.setString(10, req.password());
      return ps;
    }, keyHolder);

    Long id = ((Number) keyHolder.getKeys().get("id")).longValue();
    return findByIdAndAdvisor(id, advisorId).orElseThrow();
  }

  public Optional<Client> update(Long id, Long advisorId, ClientRequest req) {
    // If password is __SET__, keep the existing password (don't update it)
    String existingPassword = null;
    if ("__SET__".equals(req.password())) {
      existingPassword = findByIdAndAdvisor(id, advisorId)
          .map(Client::password)
          .orElse(null);
    }

    int updated = jdbc.update(
        "UPDATE clients SET first_name=?, last_name=?, email=?, phone=?, birth_date=?, address=?, notes=?, username=?, password=?, updated_at=NOW() " +
        "WHERE id=? AND advisor_id=?",
        req.firstName(), req.lastName(), req.email(), req.phone(),
        req.birthDate(), req.address(), req.notes(), req.username(),
        existingPassword != null ? existingPassword : req.password(),
        id, advisorId
    );
    if (updated == 0) return Optional.empty();
    return findByIdAndAdvisor(id, advisorId);
  }

  public boolean delete(Long id, Long advisorId) {
    return jdbc.update("DELETE FROM clients WHERE id=? AND advisor_id=?", id, advisorId) > 0;
  }
}
