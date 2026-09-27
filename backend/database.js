const { createClient } = require("@libsql/client");

if (!process.env.TURSO_DATABASE_URL) {
    throw new Error("TURSO_DATABASE_URL is missing.");
}

if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error("TURSO_AUTH_TOKEN is missing.");
}

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

const ready = (async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Turso database connected.");
        console.log("Tasks table is ready.");

    } catch (error) {
        console.error(
            "Database initialization failed:",
            error.message
        );

        throw error;
    }
})();

module.exports = {
    db,
    ready
};