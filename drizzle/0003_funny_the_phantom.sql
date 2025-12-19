-- Manual migration: SQLite doesn't support "Set default to column" out of the box
-- The address table defaults are already defined in the initial schema (0000)
-- This migration serves as a placeholder
-- See: https://www.sqlite.org/lang_altertable.html

-- No-op statement to satisfy migration system
PRAGMA schema_version;

