-- Adds ideas: recipes worth developing someday, ranked by position (lowest first).
-- Notes are a JSON list of strings, like recipes.notes, and become the recipe's notes when work starts.

CREATE TABLE ideas (
  id TEXT PRIMARY KEY,
  position INTEGER NOT NULL,
  title TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);

CREATE INDEX idx_ideas_position ON ideas(position);
