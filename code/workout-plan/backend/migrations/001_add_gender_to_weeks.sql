-- Dodaj kolumnę gender do tabeli weeks
ALTER TABLE weeks ADD COLUMN gender TEXT NOT NULL DEFAULT 'man';
