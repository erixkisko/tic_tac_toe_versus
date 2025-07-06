import { useState } from "react";
import { useNavigate } from "react-router";

const JoinGame = () => {
  const [playerName, setPlayerName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!playerName.trim() || !sessionId.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsJoining(true);

    try {
      // First check if session exists
      const checkResponse = await fetch(
        `http://localhost:5001/api/sessions/${sessionId.trim()}`
      );

      if (!checkResponse.ok) {
        throw new Error("Game not found. Please check the session ID.");
      }

      // Join the session
      const joinResponse = await fetch(
        `http://localhost:5001/api/sessions/${sessionId.trim()}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: playerName.trim() }),
        }
      );

      if (!joinResponse.ok) {
        throw new Error("Failed to join the game.");
      }

      // Store player info in localStorage for the current session
      localStorage.setItem("currentPlayer", playerName.trim());
      localStorage.setItem("playerType", "O");

      void navigate(`/session/${sessionId.trim()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join game");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Join Game</h2>

      <form
        onSubmit={(e) => {
          void handleJoinGame(e);
        }}
      >
        <div className="input-group">
          <label htmlFor="playerName">Your Name</label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            required
            disabled={isJoining}
          />
        </div>

        <div className="input-group">
          <label htmlFor="sessionId">Session ID</label>
          <input
            id="sessionId"
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Enter session ID"
            required
            disabled={isJoining}
          />
        </div>

        {error && (
          <div
            style={{
              color: "#dc3545",
              marginBottom: "20px",
              padding: "10px",
              background: "#f8d7da",
              borderRadius: "5px",
              border: "1px solid #f5c6cb",
            }}
          >
            {error}
          </div>
        )}

        <button type="submit" className="button" disabled={isJoining}>
          {isJoining ? "Joining..." : "Join Game"}
        </button>
      </form>

      <div style={{ marginTop: "30px" }}>
        <button
          onClick={() => {
            void navigate("/");
          }}
          className="button secondary"
          style={{ background: "#6c757d" }}
          type="button"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default JoinGame;
