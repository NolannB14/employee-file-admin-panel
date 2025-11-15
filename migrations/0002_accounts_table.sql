-- migrations/000X_accounts_table.sql
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,                         -- e.g. uuid
  email TEXT NOT NULL UNIQUE,                  -- unique login
  password TEXT NOT NULL,                      -- store a PHC-style string (see below)
  lastLogin TEXT                               -- ISO 8601 timestamp, nullable
);

-- helpful index (unique already enforces it, but this speeds lookups):
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
