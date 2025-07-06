const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Tic-Tac-Toe API is running!" });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/tic-tac-toe";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Session Schema
const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  participants: [
    {
      name: String,
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  gameState: {
    board: {
      type: [[String]],
      default: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
    },
    currentPlayer: {
      type: String,
      default: "X",
    },
    winner: {
      type: String,
      default: null,
    },
  },
});

const Session = mongoose.model("Session", sessionSchema);

// Create a new session
app.post("/api/sessions", async (req, res) => {
  try {
    const sessionId = uuidv4().substring(0, 8); // Short ID for sharing
    const session = new Session({
      sessionId,
      participants: [],
      gameState: {
        board: [
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
        ],
        currentPlayer: "X",
        winner: null,
      },
    });

    await session.save();
    res.json({
      sessionId,
      shareableUrl: `${
        process.env.CLIENT_URL || "http://localhost:5173"
      }/session/${sessionId}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Get session details
app.get("/api/sessions/:sessionId", async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get session" });
  }
});

// Join session
app.post("/api/sessions/:sessionId/join", async (req, res) => {
  try {
    const { name } = req.body;
    const session = await Session.findOne({ sessionId: req.params.sessionId });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Check if participant already exists
    const existingParticipant = session.participants.find(
      (p) => p.name === name
    );
    if (!existingParticipant) {
      session.participants.push({ name });
      await session.save();
    }

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to join session" });
  }
});

// Make a move
app.post("/api/sessions/:sessionId/move", async (req, res) => {
  try {
    const { row, col, player } = req.body;
    const session = await Session.findOne({ sessionId: req.params.sessionId });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Validate move
    if (session.gameState.board[row][col] !== "" || session.gameState.winner) {
      return res.status(400).json({ error: "Invalid move" });
    }

    // Make the move
    session.gameState.board[row][col] = player;

    // Check for winner
    const winner = checkWinner(session.gameState.board);
    if (winner) {
      session.gameState.winner = winner;
    } else if (isBoardFull(session.gameState.board)) {
      session.gameState.winner = "draw";
    } else {
      // Switch player
      session.gameState.currentPlayer =
        session.gameState.currentPlayer === "X" ? "O" : "X";
    }

    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to make move" });
  }
});

// Reset game
app.post("/api/sessions/:sessionId/reset", async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    session.gameState = {
      board: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
      currentPlayer: "X",
      winner: null,
    };

    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset game" });
  }
});

// Helper functions
const checkWinner = (board) => {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] &&
      board[i][0] === board[i][1] &&
      board[i][0] === board[i][2]
    ) {
      return board[i][0];
    }
  }

  // Check columns
  for (let i = 0; i < 3; i++) {
    if (
      board[0][i] &&
      board[0][i] === board[1][i] &&
      board[0][i] === board[2][i]
    ) {
      return board[0][i];
    }
  }

  // Check diagonals
  if (
    board[0][0] &&
    board[0][0] === board[1][1] &&
    board[0][0] === board[2][2]
  ) {
    return board[0][0];
  }

  if (
    board[0][2] &&
    board[0][2] === board[1][1] &&
    board[0][2] === board[2][0]
  ) {
    return board[0][2];
  }

  return null;
};

const isBoardFull = (board) => {
  return board.every((row) => row.every((cell) => cell !== ""));
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
