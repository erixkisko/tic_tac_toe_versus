import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";

interface GameState {
  host: string;
  guest: string | null;
  board: (string | null)[];
  currentPlayer: "X" | "O";
  winner: string | null;
  gameStarted: boolean;
}

const GameRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const playerType = searchParams.get("player");

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [copied, setCopied] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [showGuestForm, setShowGuestForm] = useState(false);

  const loadGameState = useCallback(() => {
    if (!sessionId) return;

    const gameData = localStorage.getItem(`game_${sessionId}`);
    if (!gameData) {
      void navigate("/");
      return;
    }

    const game = JSON.parse(gameData) as GameState;
    setGameState(game);

    // Check if guest player needs to enter name
    if (playerType === "guest" && !game.guest) {
      setShowGuestForm(true);
    }
  }, [navigate, playerType, sessionId]);

  useEffect(() => {
    if (!sessionId) {
      void navigate("/");
      return;
    }

    void loadGameState();

    // Poll for game state updates every second
    const interval = setInterval(() => {
      void loadGameState();
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionId, navigate, loadGameState]);

  const updateGameState = (newState: GameState) => {
    if (!sessionId) return;
    localStorage.setItem(`game_${sessionId}`, JSON.stringify(newState));
    setGameState(newState);
  };

  const checkWinner = (board: (string | null)[]): string | null => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    if (board.every((cell) => cell !== null)) {
      return "tie";
    }

    return null;
  };

  const handleCellClick = (index: number) => {
    if (!gameState || !gameState.gameStarted || gameState.winner) return;
    if (gameState.board[index]) return;

    // Check if it's the current player's turn
    const isPlayerX = playerType === "host";
    const isPlayerO = playerType === "guest";

    if (
      (gameState.currentPlayer === "X" && !isPlayerX) ||
      (gameState.currentPlayer === "O" && !isPlayerO)
    ) {
      return;
    }

    const newBoard = [...gameState.board];
    newBoard[index] = gameState.currentPlayer;

    const winner = checkWinner(newBoard);
    const nextPlayer = gameState.currentPlayer === "X" ? "O" : "X";

    updateGameState({
      ...gameState,
      board: newBoard,
      currentPlayer: nextPlayer,
      winner,
    });
  };

  const resetGame = () => {
    if (!gameState) return;

    updateGameState({
      ...gameState,
      board: Array(9).fill(null) as (string | null)[],
      currentPlayer: "X",
      winner: null,
    });
  };

  const handleGuestJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !gameState) return;

    const updatedGame = {
      ...gameState,
      guest: guestName.trim(),
      gameStarted: true,
    };

    void updateGameState(updatedGame);
    setShowGuestForm(false);
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/game/${sessionId}?player=guest`;
    void navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show guest name form if guest hasn't joined yet
  if (showGuestForm && playerType === "guest") {
    return (
      <div className="page-container">
        <h2 className="page-title">Join Game: {sessionId}</h2>
        <p style={{ marginBottom: "20px", color: "#666" }}>
          You're about to join <strong>{gameState?.host}</strong>'s game!
        </p>

        <form
          onSubmit={(e) => {
            handleGuestJoin(e);
          }}
        >
          <div className="input-group">
            <label htmlFor="guestName">Your Name</label>
            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter your name"
              required
              autoFocus
            />
          </div>

          <button type="submit" className="button" disabled={!guestName.trim()}>
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
  }

  const getWinnerText = () => {
    if (!gameState?.winner) return "";
    if (gameState.winner === "tie") return "It's a tie!";

    const winnerName =
      gameState.winner === "X" ? gameState.host : gameState.guest;
    return `${winnerName} wins!`;
  };

  const getCurrentPlayerText = () => {
    if (!gameState?.gameStarted || gameState.winner) return "";

    const currentPlayerName =
      gameState.currentPlayer === "X" ? gameState.host : gameState.guest;
    const isMyTurn =
      (playerType === "host" && gameState.currentPlayer === "X") ||
      (playerType === "guest" && gameState.currentPlayer === "O");

    return isMyTurn ? "Your turn!" : `${currentPlayerName}'s turn`;
  };

  if (!gameState) {
    return (
      <div className="page-container">
        <h2 className="page-title">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Game Room: {sessionId}</h2>

      <div className="player-info">
        <div
          className={`player ${
            gameState.currentPlayer === "X" ? "active" : ""
          }`}
        >
          <div>
            <strong>{gameState.host}</strong>
          </div>
          <div>Playing as X</div>
        </div>
        <div
          className={`player ${
            gameState.currentPlayer === "O" ? "active" : ""
          }`}
        >
          <div>
            <strong>{gameState.guest || "Waiting..."}</strong>
          </div>
          <div>Playing as O</div>
        </div>
      </div>

      {!gameState.gameStarted && !gameState.guest && (
        <div>
          <p style={{ marginBottom: "20px", color: "#666" }}>
            Waiting for another player to join...
          </p>
          <div className="copy-link" onClick={copyInviteLink}>
            <div
              style={{
                marginBottom: "10px",
                fontSize: "0.9rem",
                color: "#666",
              }}
            >
              Share this link with your friend:
            </div>
            <div style={{ fontWeight: "bold" }}>
              {window.location.origin}/game/{sessionId}?player=guest
            </div>
            <div
              style={{ marginTop: "10px", fontSize: "0.8rem", color: "#999" }}
            >
              {copied ? "✓ Copied!" : "Click to copy"}
            </div>
          </div>
        </div>
      )}

      {gameState.gameStarted && (
        <>
          <div className="game-status">
            {gameState.winner ? getWinnerText() : getCurrentPlayerText()}
          </div>

          <div className="game-board">
            {gameState.board.map((cell, idx) => (
              <div
                key={`cell-${sessionId}-${idx}-${cell ?? "empty"}-${btoa(
                  gameState.board.join("|")
                )}`}
                className={`game-cell ${cell ? cell.toLowerCase() : ""} ${
                  !gameState.gameStarted || gameState.winner ? "disabled" : ""
                }`}
                onClick={() => {
                  handleCellClick(idx);
                }}
              >
                {cell}
              </div>
            ))}
          </div>

          {gameState.winner && (
            <button
              onClick={() => {
                void resetGame();
              }}
              className="button"
              type="button"
            >
              Play Again
            </button>
          )}
        </>
      )}

      <div style={{ marginTop: "30px" }}>
        <button
          onClick={() => {
            void navigate("/");
          }}
          className="button secondary"
          style={{ background: "#6c757d" }}
          type="button"
        >
          ← Leave Game
        </button>
      </div>
    </div>
  );
};

export default GameRoom;
