import React, { useState } from "react";
import ChessGame from "./ChessGame";
import "./App.css";

function App() {
  const [mode, setMode] = useState(null);

  return (
    <div className="container">
      {!mode ? (
        <div className="menu">
          <button onClick={() => setMode("ai")}>Play vs AI</button>
          <button onClick={() => setMode("multiplayer")}>Multiplayer</button>
        </div>
      ) : (
        <ChessGame mode={mode} />
      )}
    </div>
  );
}

export default App;