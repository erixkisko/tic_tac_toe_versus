const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Create a new session
app.post("/api/sessions", async (req, res) => {
  const id = uuidv4();
  try {
    await pool.query("INSERT INTO sessions(id) VALUES($1)", [id]);
    res.json({ sessionId: id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Add participant to session
app.post("/api/sessions/:id/participants", async (req, res) => {
  const sessionId = req.params.id;
  const { name } = req.body;
  try {
    await pool.query(
      "INSERT INTO participants(session_id, name) VALUES($1, $2)",
      [sessionId, name]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
