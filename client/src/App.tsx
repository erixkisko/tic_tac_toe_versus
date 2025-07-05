import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import CreateGame from "./Components/CreateGame";
import GameRoom from "./Components/GameRoom";
import HomePage from "./Components/HomePage";
import JoinGame from "./Components/JoinGame";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1>🎮 Tic-Tac-Toe Versus</h1>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateGame />} />
            <Route path="/join" element={<JoinGame />} />
            <Route path="/game/:sessionId" element={<GameRoom />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
