import React, { useState } from "react";
import ChessGame from "./ChessGame";
import "./App.css";

function App() {
  const [mode, setMode] = useState(null);
  const [gameStart, setGameStart] = useState(false);

  return (
    <div className="container">
      {!mode ? (
        <div className="menu">
          <button onClick={() => setMode("ai")}>Play vs AI</button>
          <button onClick={() => setMode("multiplayer")}>Multiplayer</button>
        </div>
      ) : (
        <div className="game-options">
          {!gameStart && ( 
            <button onClick={() => setGameStart(true)}>Start Game</button>
          )}
        </div>
      )}

      {gameStart && <ChessGame mode={mode} goToMainPage={() => navigate("/")} />}
    </div>
  );
}

export default App;
