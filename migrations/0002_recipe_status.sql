-- Adds a status to recipes: 'development' (still being worked on) or 'ready'.
-- New recipes start in development. Recipes that already exist were finished, so they become ready.

ALTER TABLE recipes ADD COLUMN status TEXT NOT NULL DEFAULT 'development'
  CHECK (status IN ('development', 'ready'));

UPDATE recipes SET status = 'ready';
