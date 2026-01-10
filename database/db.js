const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, 'praxis.db');

// Create and export database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✓ Connected to SQLite database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Users table
            db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          display_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
                if (err) console.error('Error creating users table:', err);
                else console.log('✓ Users table ready');
            });

            // Habits table
            db.run(`
        CREATE TABLE IF NOT EXISTS habits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          weekly_target INTEGER DEFAULT 7,
          color TEXT DEFAULT '#4A5D23',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
                if (err) console.error('Error creating habits table:', err);
                else console.log('✓ Habits table ready');
            });

            // Habit completions table
            db.run(`
        CREATE TABLE IF NOT EXISTS habit_completions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          habit_id INTEGER NOT NULL,
          completion_date DATE NOT NULL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(habit_id, completion_date),
          FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
        )
      `, (err) => {
                if (err) console.error('Error creating habit_completions table:', err);
                else console.log('✓ Habit completions table ready');
            });

            // Pomodoro sessions table
            db.run(`
        CREATE TABLE IF NOT EXISTS pomodoro_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          habit_id INTEGER,
          task_name TEXT,
          duration INTEGER DEFAULT 25,
          session_type TEXT DEFAULT 'work',
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE SET NULL
        )
      `, (err) => {
                if (err) {
                    console.error('Error creating pomodoro_sessions table:', err);
                    reject(err);
                } else {
                    console.log('✓ Pomodoro sessions table ready');
                    resolve();
                }
            });
        });
    });
}

// Helper function to run queries with promises
db.runAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
        this.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

db.getAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
        this.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

db.allAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
        this.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = { db, initializeDatabase };
