import React, { useState } from "react";
import ChessGame from "./ChessGame";
import "./App.css";

function App() {
  const [mode, setMode] = useState(null);
  const [gameStart, setGameStart] = useState(false);
  const [playerColor, setPlayerColor] = useState("white");

  const startGame = (color) => {
    setPlayerColor(color);
    setGameStart(true);
  };


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
            mode === 'ai' ? (
              <>
                <button onClick={() => startGame("white")}>Play as White</button>
                <button onClick={() => startGame("black")}>Play as Black</button>
              </>
            ) : (
              <button onClick={() => setGameStart(true)}>Start Game</button>
            )
          )}
        </div>
      )}

      {gameStart && <ChessGame mode={mode} playerColor={playerColor} goToMainPage={() => navigate("/")} />}
    </div>
  );
}

export default App;
