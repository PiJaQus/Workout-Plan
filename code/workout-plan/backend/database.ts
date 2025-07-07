import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'

// Funkcja tworzy połączenie z bazą danych
export const connectToDB = async (): Promise<Database> => {
    const db = await open({
        filename: './workout.db',
        driver: sqlite3.Database
    })

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON;')

    // Create weeks table if it doesn't exist
    await db.exec(`
    CREATE TABLE IF NOT EXISTS weeks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      custom_name TEXT,
      gender TEXT NOT NULL DEFAULT 'man',
      UNIQUE(name, gender)
    )`)

    // Create workouts table if it doesn't exist
    await db.exec(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      sets INTEGER DEFAULT 3,
      reps TEXT DEFAULT '8-12',
      notes TEXT,
      muscle_groups TEXT,
      FOREIGN KEY (week_id) REFERENCES weeks (id) ON DELETE CASCADE
    )`)

    return db
}