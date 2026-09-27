const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Keep the database beside this file so the project is easy to run from any folder.
const databasePath = path.join(__dirname, 'tasks.db');
const db = new sqlite3.Database(databasePath, (error) => {
  if (error) {
    console.error('Could not open the database:', error.message);
    return;
  }

  console.log('Connected to the SQLite database.');
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
