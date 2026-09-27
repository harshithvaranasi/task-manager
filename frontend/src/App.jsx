import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = '/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [workingTaskId, setWorkingTaskId] = useState(null);

  async function loadTasks() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('The task list could not be loaded.');
      }

      setTasks(await response.json());
      setError('');
    } catch {
      setError('Could not connect to the task service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleAddTask(event) {
    event.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setError('Please enter a task title.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: cleanTitle }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'The task could not be added.');
      }

      setTitle('');
      await loadTasks();
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the task service.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleComplete(task) {
    setWorkingTaskId(task.id);
    setError('');

    try {
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'The task could not be updated.');
      }

      await loadTasks();
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the task service.');
    } finally {
      setWorkingTaskId(null);
    }
  }

  async function handleDelete(taskId) {
    setWorkingTaskId(taskId);
    setError('');

    try {
      const response = await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'The task could not be deleted.');
      }

      await loadTasks();
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the task service.');
    } finally {
      setWorkingTaskId(null);
    }
  }

  const completedCount = tasks.filter((task) => task.status === 'Completed').length;
  const pendingCount = tasks.length - completedCount;

  return (
    <main className="page-shell">
      <section className="task-manager" aria-labelledby="page-title">
        <header className="page-header">
          <div>
            <p className="eyebrow">A little more organized</p>
            <h1 id="page-title">Task Manager</h1>
          </div>
          <span className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
        </header>

        <section className="summary" aria-label="Task summary">
          <div className="summary-item">
            <span className="summary-label">Total tasks</span>
            <strong>{tasks.length}</strong>
          </div>
          <div className="summary-item pending-summary">
            <span className="summary-label">Pending</span>
            <strong>{pendingCount}</strong>
          </div>
          <div className="summary-item completed-summary">
            <span className="summary-label">Completed</span>
            <strong>{completedCount}</strong>
          </div>
        </section>

        <form className="add-task-form" onSubmit={handleAddTask}>
          <label className="visually-hidden" htmlFor="task-title">Task title</label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to get done?"
            maxLength={200}
          />
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Adding...' : 'Add Task'}
          </button>
        </form>

        {error && <p className="message error-message" role="alert">{error}</p>}

        <section className="task-section" aria-labelledby="task-list-title">
          <div className="list-heading">
            <h2 id="task-list-title">Your tasks</h2>
            <span>{pendingCount} pending</span>
          </div>

          {isLoading ? (
            <p className="empty-state">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="empty-state">No tasks yet. Add one above to get started.</p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li className={`task-row ${task.status === 'Completed' ? 'is-completed' : ''}`} key={task.id}>
                  <div className="task-copy">
                    <span className="task-marker" aria-hidden="true">
                      {task.status === 'Completed' ? '✓' : ''}
                    </span>
                    <div>
                      <p className="task-title">{task.title}</p>
                      <span className={`status-label ${task.status === 'Completed' ? 'status-completed' : 'status-pending'}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <div className="task-actions">
                    {task.status !== 'Completed' && (
                      <button
                        className="complete-button"
                        type="button"
                        onClick={() => handleComplete(task)}
                        disabled={workingTaskId === task.id}
                      >
                        Complete
                      </button>
                    )}
                    <button
                      className="delete-button"
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      disabled={workingTaskId === task.id}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
      <footer className="page-footer">Small steps, finished well.</footer>
    </main>
  );
}

export default App;
