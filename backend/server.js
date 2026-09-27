const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// Home / Health Check
// ===============================
app.get("/", (req, res) => {
    res.json({
        message: "Task Manager API is running",
        status: "OK"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy"
    });
});

// ===============================
// GET ALL TASKS
// GET /api/tasks
// ===============================
app.get("/api/tasks", (req, res) => {
    db.all(
        "SELECT * FROM tasks ORDER BY id DESC",
        [],
        (error, tasks) => {
            if (error) {
                console.error("GET tasks error:", error);
                return res.status(500).json({
                    error: "Could not load tasks."
                });
            }

            res.json(tasks);
        }
    );
});

// ===============================
// ADD NEW TASK
// POST /api/tasks
// ===============================
app.post("/api/tasks", (req, res) => {
    const title =
        typeof req.body.title === "string"
            ? req.body.title.trim()
            : "";

    if (!title) {
        return res.status(400).json({
            error: "Task title is required."
        });
    }

    db.run(
        "INSERT INTO tasks (title) VALUES (?)",
        [title],
        function (error) {
            if (error) {
                console.error("POST task error:", error);

                return res.status(500).json({
                    error: "Could not add the task."
                });
            }

            db.get(
                "SELECT * FROM tasks WHERE id = ?",
                [this.lastID],
                (selectError, task) => {
                    if (selectError) {
                        console.error(
                            "GET inserted task error:",
                            selectError
                        );

                        return res.status(500).json({
                            error:
                                "Task was added, but could not be loaded."
                        });
                    }

                    res.status(201).json(task);
                }
            );
        }
    );
});

// ===============================
// UPDATE TASK STATUS
// PUT /api/tasks/:id
// ===============================
app.put("/api/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(taskId) || taskId < 1) {
        return res.status(400).json({
            error: "Task ID must be a positive integer."
        });
    }

    if (status !== "Pending" && status !== "Completed") {
        return res.status(400).json({
            error: "Status must be Pending or Completed."
        });
    }

    db.run(
        "UPDATE tasks SET status = ? WHERE id = ?",
        [status, taskId],
        function (error) {
            if (error) {
                console.error("PUT task error:", error);

                return res.status(500).json({
                    error: "Could not update the task."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Task not found."
                });
            }

            db.get(
                "SELECT * FROM tasks WHERE id = ?",
                [taskId],
                (selectError, task) => {
                    if (selectError) {
                        console.error(
                            "GET updated task error:",
                            selectError
                        );

                        return res.status(500).json({
                            error:
                                "Task was updated, but could not be loaded."
                        });
                    }

                    res.json(task);
                }
            );
        }
    );
});

// ===============================
// DELETE TASK
// DELETE /api/tasks/:id
// ===============================
app.delete("/api/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId) || taskId < 1) {
        return res.status(400).json({
            error: "Task ID must be a positive integer."
        });
    }

    db.run(
        "DELETE FROM tasks WHERE id = ?",
        [taskId],
        function (error) {
            if (error) {
                console.error("DELETE task error:", error);

                return res.status(500).json({
                    error: "Could not delete the task."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Task not found."
                });
            }

            res.status(204).send();
        }
    );
});

// ===============================
// LOCAL DEVELOPMENT
// ===============================
// Run app.listen only when running
// locally. Vercel handles the server
// automatically in production.
if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
        console.log(
            `Task Manager API is running at http://localhost:${PORT}`
        );
    });
}

// ===============================
// VERCEL EXPORT
// ===============================
module.exports = app;