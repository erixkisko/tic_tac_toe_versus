import { Link } from "react-router";

const HomePage = () => {
  return (
    <div className="page-container">
      <h2 className="page-title">Welcome to Tic-Tac-Toe Versus!</h2>
      <p style={{ marginBottom: "30px", color: "#666", lineHeight: 1.6 }}>
        Create a session and share the link with friends to play tic-tac-toe
        together! Anyone with the link can join and participate in real-time
        gameplay.
      </p>

      <div>
        <Link to="/create" className="button">
          🎮 Create Session
        </Link>
        <Link to="/join" className="button secondary">
          🔗 Join Session
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
