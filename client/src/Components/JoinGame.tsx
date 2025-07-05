import { useState } from "react";
import { useNavigate } from "react-router";

const JoinGame = () => {
  const [playerName, setPlayerName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!playerName.trim() || !sessionId.trim()) {
      setError("Please fill in all fields");
      return;
    }

    const gameData = localStorage.getItem(`game_${sessionId.toUpperCase()}`);
    if (!gameData) {
      setError("Game not found. Please check the game ID.");
      return;
    }

    const game = JSON.parse(gameData) as {
      guest: string | null;
      gameStarted: boolean;
    };
    if (game.guest) {
      setError("This game is already full.");
      return;
    }

    // Add guest player to the game
    game.guest = playerName.trim();
    game.gameStarted = true;
    localStorage.setItem(
      `game_${sessionId.toUpperCase()}`,
      JSON.stringify(game)
    );

    void navigate(`/game/${sessionId.toUpperCase()}?player=guest`);
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Join Game</h2>

      <form
        onSubmit={(e) => {
          handleJoinGame(e);
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
          />
        </div>

        <div className="input-group">
          <label htmlFor="sessionId">Game ID</label>
          <input
            id="sessionId"
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value.toUpperCase())}
            placeholder="Enter game ID"
            required
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

        <button type="submit" className="button">
          Join Game
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
