const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Vercel functions cannot permanently write to the deployed project folder.
// /tmp is writable during a function instance, so use it on Vercel.
// Locally, continue using the normal tasks.db file.
const isVercel = process.env.VERCEL === "1";

const databasePath = isVercel
    ? path.join("/tmp", "tasks.db")
    : path.join(__dirname, "tasks.db");

console.log("Database path:", databasePath);

const db = new sqlite3.Database(databasePath, (error) => {
    if (error) {
        console.error("Could not open the database:", error.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

// Create the tasks table if it doesn't exist.
db.serialize(() => {
    db.run(
        `
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `,
        (error) => {
            if (error) {
                console.error(
                    "Could not create tasks table:",
                    error.message
                );
            } else {
                console.log("Tasks table is ready.");
            }
        }
    );
});

module.exports = db;