import { useState } from "react";
import { useNavigate } from "react-router";

const CreateGame = () => {
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();

  const generateSessionId = (): string => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      const sessionId = generateSessionId();
      // Store player info in sessionStorage for now
      localStorage.setItem(
        `game_${sessionId}`,
        JSON.stringify({
          host: playerName.trim(),
          guest: null,
          board: Array(9).fill(null),
          currentPlayer: "X",
          winner: null,
          gameStarted: false,
        })
      );

      void navigate(`/game/${sessionId}?player=host`);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Create New Game</h2>

      <form onSubmit={handleCreateGame}>
        <div className="input-group">
          <label htmlFor="playerName">Your Name</label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>

        <button type="submit" className="button" disabled={!playerName.trim()}>
          Create Game Room
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
