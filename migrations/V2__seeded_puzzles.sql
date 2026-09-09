CREATE TABLE seeded_puzzles (
    seed text PRIMARY KEY,
    vertical_categories text[] NOT NULL,
    horizontal_categories text[] NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
