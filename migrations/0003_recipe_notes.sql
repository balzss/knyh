-- Adds free-form notes to recipes: a JSON list of strings, like ingredients and instructions.

ALTER TABLE recipes ADD COLUMN notes TEXT NOT NULL DEFAULT '[]';
