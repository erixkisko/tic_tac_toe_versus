import { useState } from "react";
import { useNavigate } from "react-router";

type SessionResponse = {
  sessionId: string;
  shareableUrl: string;
};

const CreateGame = () => {
  const [playerName, setPlayerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = (await response.json()) as SessionResponse;

      // Join the session as the creator
      const joinResponse = await fetch(
        `http://localhost:5001/api/sessions/${data.sessionId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: playerName.trim() }),
        }
      );

      if (!joinResponse.ok) {
        throw new Error("Failed to join session");
      }

      // Store player info in localStorage for the current session
      localStorage.setItem("currentPlayer", playerName.trim());
      localStorage.setItem("playerType", "X");

      void navigate(`/session/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Create New Game</h2>

      <form
        onSubmit={(e) => {
          void handleCreateGame(e);
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
            disabled={isCreating}
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

        <button
          type="submit"
          className="button"
          disabled={!playerName.trim() || isCreating}
        >
          {isCreating ? "Creating..." : "Create Game Room"}
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

export default CreateGame;
