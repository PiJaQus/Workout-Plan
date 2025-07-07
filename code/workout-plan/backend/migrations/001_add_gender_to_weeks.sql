-- Dodaj kolumnę gender do tabeli weeks
ALTER TABLE weeks ADD COLUMN gender TEXT NOT NULL DEFAULT 'man';
-- Add muscle_groups column to workouts table
ALTER TABLE workouts ADD COLUMN muscle_groups TEXT;