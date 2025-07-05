import { Link } from "react-router";

const HomePage = () => {
  return (
    <div className="page-container">
      <h2 className="page-title">Welcome to Tic-Tac-Toe Versus!</h2>
      <p style={{ marginBottom: "30px", color: "#666", lineHeight: 1.6 }}>
        Challenge your friends to the classic game of tic-tac-toe. Create a game
        and share the link, or join an existing game!
      </p>

      <div>
        <Link to="/create" className="button">
          🎮 Create New Game
        </Link>
        <Link to="/join" className="button secondary">
          🔗 Join Game
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
