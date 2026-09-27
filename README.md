# Task Manager

A small full-stack task tracker for a college project demonstration. Tasks are stored in SQLite, so they remain available after refreshing the page or restarting the backend.

## Features

- View, add, complete, and delete tasks
- Summary of total, pending, and completed tasks
- Basic input validation and error messages
- Automatic SQLite database and table creation

## Technologies

- Frontend: React and Vite
- Backend: Node.js and Express
- Database: SQLite (`sqlite3`)
- API: REST with JSON and `fetch()`

## Folder structure

```text
task-manager/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── tasks.db       (created automatically when the backend starts)
│   ├── package.json
│   └── .env
└── README.md
```

## Install dependencies

Open a terminal in the `task-manager` folder and install each part:

```bash
cd backend
npm install
cd ../frontend
npm install
```

## Start the project

Open two terminals from the workspace root (the folder containing `task-manager`).

Terminal 1, start the backend:

```bash
cd task-manager/backend
npm run dev
```

The API runs at <http://localhost:5000>. The `dev` command uses nodemon and restarts the backend when its files change. To run without nodemon, use `npm start` instead.

Terminal 2, start the frontend:

```bash
cd task-manager/frontend
npm run dev
```

Open the local URL printed by Vite, usually <http://localhost:5173>.

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/tasks` | Return all tasks |
| `POST` | `/api/tasks` | Add a task using `{ "title": "Complete assignment" }` |
| `PUT` | `/api/tasks/:id` | Set status using `{ "status": "Completed" }` or `{ "status": "Pending" }` |
| `DELETE` | `/api/tasks/:id` | Delete a task |

New tasks start with `Pending`. The API returns `400` for invalid input or IDs, `404` if a valid task ID does not exist, `201` when a task is created, and `204` when one is deleted.

## How the parts communicate

The React page requests the task list from the Express REST API. Express reads and changes rows using the SQLite connection exported by `database.js`. The database file and `tasks` table are created automatically in `backend/`.

```text
User
  ↓
React Frontend
  ↓
REST API
  ↓
Node.js + Express
  ↓
SQLite Database
```
