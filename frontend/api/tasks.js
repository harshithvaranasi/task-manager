import { formatTask, getDatabase } from '../lib/database.js';

export default async function handler(request, response) {
  try {
    const database = await getDatabase();

    if (request.method === 'GET') {
      const result = await database.execute('SELECT * FROM tasks ORDER BY id DESC');
      return response.status(200).json(result.rows.map(formatTask));
    }

    if (request.method === 'POST') {
      const title = typeof request.body?.title === 'string' ? request.body.title.trim() : '';
      if (!title) {
        return response.status(400).json({ error: 'Task title is required.' });
      }

      const insert = await database.execute({
        sql: 'INSERT INTO tasks (title) VALUES (?)',
        args: [title],
      });
      const result = await database.execute({
        sql: 'SELECT * FROM tasks WHERE id = ?',
        args: [insert.lastInsertRowid],
      });

      return response.status(201).json(formatTask(result.rows[0]));
    }

    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('Task API error:', error);
    return response.status(500).json({ error: 'Task service is unavailable.' });
  }
}