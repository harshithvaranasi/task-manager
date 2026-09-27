import { createClient } from '@libsql/client';

let client;
let tableReady;

export async function getDatabase() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be configured.');
  }

  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  if (!tableReady) {
    tableReady = client.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  await tableReady;
  return client;
}

export function formatTask(row) {
  return {
    id: Number(row.id),
    title: String(row.title),
    status: String(row.status),
    created_at: String(row.created_at),
  };
}