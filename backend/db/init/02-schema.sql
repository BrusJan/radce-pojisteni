-- Users (insurance advisors)
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Clients managed by advisors
CREATE TABLE IF NOT EXISTS clients (
    id           BIGSERIAL PRIMARY KEY,
    advisor_id   BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(255),
    phone        VARCHAR(50),
    birth_date   DATE,
    address      TEXT,
    notes        TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Files uploaded by advisors
CREATE TABLE IF NOT EXISTS files (
    id           BIGSERIAL PRIMARY KEY,
    advisor_id   BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename     VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type    VARCHAR(100),
    size_bytes   BIGINT,
    is_public    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Default admin user (password: admin123 — bcrypt hash)
-- Default admin user (password: admin123)
INSERT INTO users (email, password, full_name)
VALUES ('admin@example.com', '$2b$12$f6KWns09gC7ZXQ7spty/Qun2P6tlMuXzBbCW0RjIiZrFGGFu3zuJq', 'Admin User')
ON CONFLICT (email) DO NOTHING;
