package com.insuranceadvisor.backend.file;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class FileRepository {

  private final JdbcTemplate jdbc;

  private final RowMapper<AdvisorFile> rowMapper = (rs, rowNum) -> new AdvisorFile(
      rs.getLong("id"),
      rs.getLong("advisor_id"),
      rs.getString("filename"),
      rs.getString("original_name"),
      rs.getString("mime_type"),
      rs.getLong("size_bytes"),
      rs.getBoolean("is_public"),
      rs.getTimestamp("created_at").toInstant()
  );

  public FileRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public List<AdvisorFile> findAllByAdvisor(Long advisorId) {
    return jdbc.query(
        "SELECT * FROM files WHERE advisor_id = ? ORDER BY created_at DESC",
        rowMapper, advisorId
    );
  }

  public Optional<AdvisorFile> findByIdAndAdvisor(Long id, Long advisorId) {
    var rows = jdbc.query(
        "SELECT * FROM files WHERE id = ? AND advisor_id = ?",
        rowMapper, id, advisorId
    );
    return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
  }

  public AdvisorFile save(Long advisorId, String filename, String originalName, String mimeType, Long sizeBytes) {
    var keyHolder = new GeneratedKeyHolder();
    jdbc.update(con -> {
      PreparedStatement ps = con.prepareStatement(
          "INSERT INTO files (advisor_id, filename, original_name, mime_type, size_bytes) VALUES (?, ?, ?, ?, ?)",
          Statement.RETURN_GENERATED_KEYS
      );
      ps.setLong(1, advisorId);
      ps.setString(2, filename);
      ps.setString(3, originalName);
      ps.setString(4, mimeType);
      ps.setLong(5, sizeBytes);
      return ps;
    }, keyHolder);

    Long id = ((Number) keyHolder.getKeys().get("id")).longValue();
    return findByIdAndAdvisor(id, advisorId).orElseThrow();
  }

  public Optional<AdvisorFile> setPublic(Long id, Long advisorId, boolean isPublic) {
    int updated = jdbc.update(
        "UPDATE files SET is_public = ? WHERE id = ? AND advisor_id = ?",
        isPublic, id, advisorId
    );
    if (updated == 0) return Optional.empty();
    return findByIdAndAdvisor(id, advisorId);
  }

  public boolean delete(Long id, Long advisorId) {
    return jdbc.update("DELETE FROM files WHERE id = ? AND advisor_id = ?", id, advisorId) > 0;
  }
}
