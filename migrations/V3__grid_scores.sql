CREATE TABLE grid_scores (
    id                 BIGSERIAL PRIMARY KEY,
    created_at         timestamptz NOT NULL DEFAULT now(),
    game_state         text NOT NULL,
    score              integer NOT NULL,
    guesses_remaining  integer NOT NULL,
    mode               text NOT NULL,
    puzzle_date        date NOT NULL,
    puzzle_number      integer,
    user_agent         text,
    country_iso2       text,
    grid_state         jsonb
);

CREATE INDEX idx_grid_scores_date ON grid_scores (puzzle_date);
