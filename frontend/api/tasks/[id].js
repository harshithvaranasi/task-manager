import { formatTask, getDatabase } from '../../lib/database.js';

export default async function handler(request, response) {
  const taskId = Number(request.query.id);
  if (!Number.isInteger(taskId) || taskId < 1) {
    return response.status(400).json({ error: 'Task ID must be a positive integer.' });
  }

  try {
    const database = await getDatabase();

    if (request.method === 'PUT') {
      const { status } = request.body || {};
      if (status !== 'Pending' && status !== 'Completed') {
        return response.status(400).json({ error: 'Status must be Pending or Completed.' });
      }

      const update = await database.execute({
        sql: 'UPDATE tasks SET status = ? WHERE id = ?',
        args: [status, taskId],
      });
      if (Number(update.rowsAffected) === 0) {
        return response.status(404).json({ error: 'Task not found.' });
      }

      const result = await database.execute({
        sql: 'SELECT * FROM tasks WHERE id = ?',
        args: [taskId],
      });
      return response.status(200).json(formatTask(result.rows[0]));
    }

    if (request.method === 'DELETE') {
      const result = await database.execute({
        sql: 'DELETE FROM tasks WHERE id = ?',
        args: [taskId],
      });
      if (Number(result.rowsAffected) === 0) {
        return response.status(404).json({ error: 'Task not found.' });
      }

      return response.status(204).end();
    }

    response.setHeader('Allow', 'PUT, DELETE');
    return response.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('Task API error:', error);
    return response.status(500).json({ error: 'Task service is unavailable.' });
  }
}