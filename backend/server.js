const express = require("express");
const cors = require("cors");
const { db, ready } = require("./database");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// =====================================
// HOME
// =====================================

app.get("/", async (req, res) => {
    try {
        await ready;

        res.json({
            message: "Task Manager API is running",
            status: "OK"
        });
    } catch (error) {
        res.status(500).json({
            error: "Database initialization failed"
        });
    }
});


// =====================================
// HEALTH CHECK
// =====================================

app.get("/api/health", async (req, res) => {
    try {
        await ready;

        await db.execute("SELECT 1");

        res.json({
            status: "healthy",
            database: "connected"
        });
    } catch (error) {
        console.error("Health check error:", error);

        res.status(500).json({
            status: "unhealthy",
            database: "disconnected"
        });
    }
});


// =====================================
// GET ALL TASKS
// =====================================

app.get("/api/tasks", async (req, res) => {
    try {
        await ready;

        const result = await db.execute(
            "SELECT * FROM tasks ORDER BY id DESC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("GET tasks error:", error);

        res.status(500).json({
            error: "Could not load tasks."
        });
    }
});


// =====================================
// CREATE TASK
// =====================================

app.post("/api/tasks", async (req, res) => {
    try {
        await ready;

        const title =
            typeof req.body.title === "string"
                ? req.body.title.trim()
                : "";

        if (!title) {
            return res.status(400).json({
                error: "Task title is required."
            });
        }

        const result = await db.execute({
            sql: "INSERT INTO tasks (title) VALUES (?)",
            args: [title]
        });

        const taskId = Number(result.lastInsertRowid);

        const taskResult = await db.execute({
            sql: "SELECT * FROM tasks WHERE id = ?",
            args: [taskId]
        });

        res.status(201).json(taskResult.rows[0]);

    } catch (error) {
        console.error("POST task error:", error);

        res.status(500).json({
            error: "Could not add the task."
        });
    }
});


// =====================================
// UPDATE TASK
// =====================================

app.put("/api/tasks/:id", async (req, res) => {
    try {
        await ready;

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

        const result = await db.execute({
            sql: "UPDATE tasks SET status = ? WHERE id = ?",
            args: [status, taskId]
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                error: "Task not found."
            });
        }

        const taskResult = await db.execute({
            sql: "SELECT * FROM tasks WHERE id = ?",
            args: [taskId]
        });

        res.json(taskResult.rows[0]);

    } catch (error) {
        console.error("PUT task error:", error);

        res.status(500).json({
            error: "Could not update the task."
        });
    }
});


// =====================================
// DELETE TASK
// =====================================

app.delete("/api/tasks/:id", async (req, res) => {
    try {
        await ready;

        const taskId = Number(req.params.id);

        if (!Number.isInteger(taskId) || taskId < 1) {
            return res.status(400).json({
                error: "Task ID must be a positive integer."
            });
        }

        const result = await db.execute({
            sql: "DELETE FROM tasks WHERE id = ?",
            args: [taskId]
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                error: "Task not found."
            });
        }

        res.status(204).send();

    } catch (error) {
        console.error("DELETE task error:", error);

        res.status(500).json({
            error: "Could not delete the task."
        });
    }
});


// =====================================
// LOCAL DEVELOPMENT
// =====================================

if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
        console.log(
            `Task Manager API running at http://localhost:${PORT}`
        );
    });
}


// =====================================
// VERCEL
// =====================================

module.exports = app;