require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Return every task, with the newest tasks first.
app.get('/api/tasks', (request, response) => {
  db.all('SELECT * FROM tasks ORDER BY id DESC', [], (error, tasks) => {
    if (error) {
      return response.status(500).json({ error: 'Could not load tasks.' });
    }

    response.json(tasks);
  });
});

// Add a task with its default Pending status.
app.post('/api/tasks', (request, response) => {
  const title = typeof request.body.title === 'string' ? request.body.title.trim() : '';

  if (!title) {
    return response.status(400).json({ error: 'Task title is required.' });
  }

  db.run('INSERT INTO tasks (title) VALUES (?)', [title], function (error) {
    if (error) {
      return response.status(500).json({ error: 'Could not add the task.' });
    }

    db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (selectError, task) => {
      if (selectError) {
        return response.status(500).json({ error: 'Task was added, but could not be loaded.' });
      }

      response.status(201).json(task);
    });
  });
});

// Update a task status. The API accepts Pending or Completed.
app.put('/api/tasks/:id', (request, response) => {
  const taskId = Number(request.params.id);
  const { status } = request.body;

  if (!Number.isInteger(taskId) || taskId < 1) {
    return response.status(400).json({ error: 'Task ID must be a positive integer.' });
  }

  if (status !== 'Pending' && status !== 'Completed') {
    return response.status(400).json({ error: 'Status must be Pending or Completed.' });
  }

  db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId], function (error) {
    if (error) {
      return response.status(500).json({ error: 'Could not update the task.' });
    }

    if (this.changes === 0) {
      return response.status(404).json({ error: 'Task not found.' });
    }

    db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (selectError, task) => {
      if (selectError) {
        return response.status(500).json({ error: 'Task was updated, but could not be loaded.' });
      }

      response.json(task);
    });
  });
});

// Delete one task and report a missing ID clearly.
app.delete('/api/tasks/:id', (request, response) => {
  const taskId = Number(request.params.id);

  if (!Number.isInteger(taskId) || taskId < 1) {
    return response.status(400).json({ error: 'Task ID must be a positive integer.' });
  }

  db.run('DELETE FROM tasks WHERE id = ?', [taskId], function (error) {
    if (error) {
      return response.status(500).json({ error: 'Could not delete the task.' });
    }

    if (this.changes === 0) {
      return response.status(404).json({ error: 'Task not found.' });
    }

    response.status(204).send();
  });
});

app.listen(port, () => {
  console.log(`Task Manager API is running at http://localhost:${port}`);
});
