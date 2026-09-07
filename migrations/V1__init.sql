CREATE TABLE answer_frequencies (
    id SERIAL PRIMARY KEY,
    wca_id TEXT NOT NULL,
    cat1 TEXT NOT NULL,
    cat2 TEXT NOT NULL,
    hits INTEGER,
    showings INTEGER
);

CREATE TABLE daily_puzzles (
    puzzle_date date PRIMARY KEY,
    puzzle_number int NOT NULL,
    vertical_categories text[] NOT NULL,
    horizontal_categories text[] NOT NULL,
    squares jsonb NOT NULL
);
