CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  firstName TEXT NOT NULL,
  lastName  TEXT NOT NULL,
  email     TEXT NOT NULL UNIQUE,
  phone     TEXT,
  role      TEXT,
  linkedin  TEXT,
  avatarUrl TEXT,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
