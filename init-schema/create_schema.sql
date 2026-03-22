-- Initial Postgres schema for wca-grid
-- This file is loaded automatically by PostgreSQL container at first startup via /docker-entrypoint-initdb.d

CREATE TABLE IF NOT EXISTS answer_frequencies (
    id SERIAL PRIMARY KEY,
    wca_id TEXT NOT NULL,
    cat1 TEXT NOT NULL,
    cat2 TEXT NOT NULL,
    hits INTEGER,
    showings INTEGER
);
