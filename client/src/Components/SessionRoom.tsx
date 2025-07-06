import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

type Participant = {
  name: string;
  joinedAt: string;
};

type GameState = {
  board: string[][];
  currentPlayer: string;
  winner: string | null;
};

type Session = {
  sessionId: string;
  createdAt: string;
  participants: Participant[];
  gameState: GameState;
};

const SessionRoom = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showNameForm, setShowNameForm] = useState(false);

  const currentPlayer = localStorage.getItem("currentPlayer");
  const playerType = localStorage.getItem("playerType");

  const loadSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(
        `http://localhost:5001/api/sessions/${sessionId}`
      );
      if (!response.ok) {
        throw new Error("Session not found");
      }
      const sessionData = (await response.json()) as Session;
      setSession(sessionData);

      // Check if current player is in participants
      if (
        currentPlayer &&
        !sessionData.participants.find((p) => p.name === currentPlayer)
      ) {
        setShowNameForm(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [sessionId, currentPlayer]);

  useEffect(() => {
    if (!sessionId) {
      void navigate("/");
      return;
    }

    void loadSession();

    // Poll for session updates every 2 seconds
    const interval = setInterval(() => {
      void loadSession();
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, navigate, loadSession]);

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !sessionId) return;

    try {
      const response = await fetch(
        `http://localhost:5001/api/sessions/${sessionId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: playerName.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to join session");
      }

      localStorage.setItem("currentPlayer", playerName.trim());
      if (!playerType) {
        localStorage.setItem("playerType", "O");
      }

      setShowNameForm(false);
      void loadSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join session");
    }
  };

  const handleCellClick = async (row: number, col: number) => {
    if (!session || !currentPlayer || session.gameState.winner) return;
    if (session.gameState.board[row][col] !== "") return;

    // Check if it's the current player's turn
    const isPlayerX = playerType === "X";
    const isPlayerO = playerType === "O";

    if (
      (session.gameState.currentPlayer === "X" && !isPlayerX) ||
      (session.gameState.currentPlayer === "O" && !isPlayerO)
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/sessions/${sessionId}/move`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            row,
            col,
            player: session.gameState.currentPlayer,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to make move");
      }

      const updatedSession = (await response.json()) as Session;
      setSession(updatedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to make move");
    }
  };

  const handleResetGame = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(
        `http://localhost:5001/api/sessions/${sessionId}/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reset game");
      }

      const updatedSession = (await response.json()) as Session;
      setSession(updatedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset game");
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/session/${sessionId}`;
    void navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>Loading session...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>Error: {error}</h2>
          <button onClick={() => void navigate("/")} className="button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page-container">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>Session not found</h2>
          <button onClick={() => void navigate("/")} className="button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Show name form if player hasn't joined yet
  if (showNameForm) {
    return (
      <div className="page-container">
        <h2 className="page-title">Join Session: {sessionId}</h2>
        <p style={{ marginBottom: "20px", color: "#666" }}>
          Join this tic-tac-toe session!
        </p>

        <form onSubmit={handleJoinSession}>
          <div className="input-group">
            <label htmlFor="playerName">Your Name</label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="button"
            disabled={!playerName.trim()}
          >
            Join Session
          </button>
        </form>

        <div style={{ marginTop: "30px" }}>
          <button
            onClick={() => void navigate("/")}
            className="button secondary"
            style={{ background: "#6c757d" }}
            type="button"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const getWinnerText = () => {
    if (!session.gameState.winner) return "";
    if (session.gameState.winner === "draw") return "It's a tie!";
    return `${session.gameState.winner} wins!`;
  };

  const getCurrentPlayerText = () => {
    if (session.gameState.winner) return "";
    return `Current player: ${session.gameState.currentPlayer}`;
  };

  const isMyTurn = () => {
    if (!currentPlayer || session.gameState.winner) return false;
    const isPlayerX = playerType === "X";
    const isPlayerO = playerType === "O";
    return (
      (session.gameState.currentPlayer === "X" && isPlayerX) ||
      (session.gameState.currentPlayer === "O" && isPlayerO)
    );
  };

  return (
    <div className="page-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 className="page-title">Session: {sessionId}</h2>
        <button onClick={copyInviteLink} className="button secondary">
          {copied ? "Copied!" : "📋 Copy Link"}
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Participants:</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {session.participants.map((participant, index) => (
            <li key={index} style={{ margin: "5px 0" }}>
              👤 {participant.name}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <h3>{getCurrentPlayerText()}</h3>
        {session.gameState.winner && (
          <h2 style={{ color: "#28a745" }}>{getWinnerText()}</h2>
        )}
        {isMyTurn() && !session.gameState.winner && (
          <p style={{ color: "#007bff", fontWeight: "bold" }}>Your turn!</p>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
          maxWidth: "300px",
          margin: "0 auto 20px",
        }}
      >
        {session.gameState.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => void handleCellClick(rowIndex, colIndex)}
              disabled={
                !isMyTurn() || cell !== "" || !!session.gameState.winner
              }
              style={{
                width: "80px",
                height: "80px",
                fontSize: "2rem",
                fontWeight: "bold",
                border: "2px solid #333",
                background: cell ? "#e9ecef" : "#fff",
                cursor:
                  isMyTurn() && cell === "" && !session.gameState.winner
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              {cell}
            </button>
          ))
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <button
          onClick={handleResetGame}
          className="button"
          style={{ marginRight: "10px" }}
        >
          🔄 New Game
        </button>
        <button onClick={() => void navigate("/")} className="button secondary">
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default SessionRoom;
