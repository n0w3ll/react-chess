import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import io from "socket.io-client";
import createStockfishWorker from "./workers/stockfishWorker";

const socket = io("http://localhost:5000");

const ChessGame = ({ mode, goToMainPage }) => {
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    const [engine, setEngine] = useState(null);
    const [engineReady, setEngineReady] = useState(false);
    const [moveHistory, setMoveHistory] = useState([]);
    const [aiLevel, setAiLevel] = useState(10); // Default AI difficulty

    // Initialize Stockfish for AI mode
    useEffect(() => {
        if (mode === "ai") {
            console.log("♟ Initializing Stockfish...");

            const worker = createStockfishWorker();
            setEngine(worker);
            setEngineReady(false);

            worker.postMessage("uci");

            worker.onmessage = (event) => {
                console.log("Stockfish:", event.data);

                if (event.data === "uciok") {
                    worker.postMessage("isready");
                }

                if (event.data === "readyok") {
                    console.log("✅ Stockfish is ready!");
                    setEngineReady(true);
                    worker.postMessage(`setoption name Skill Level value ${aiLevel}`);
                }
            };

            return () => {
                console.log("♟ Terminating Stockfish...");
                worker.terminate();
                setEngine(null);
                setEngineReady(false);
            };
        }
    }, [mode]);

    // Multiplayer mode setup
    useEffect(() => {
        if (mode === "multiplayer") {
            socket.on("move", (move) => {
                game.move(move);
                setFen(game.fen());
            });
        }

        return () => {
            socket.off("move");
        };
    }, [game, mode]);

    // Function to handle moves
    const handleMove = (move) => {
        if (game.move(move)) {
            setFen(game.fen());
            setMoveHistory((prev) => [...prev, game.history().slice(-1)[0]]);

            if (mode === "multiplayer") {
                socket.emit("move", move);
            } else if (mode === "ai") {
                makeAIMove();
            }
        }
    };

    // Function to make AI move
    const makeAIMove = () => {
        if (!engine || !engineReady) {
            console.error("❌ Stockfish engine is not initialized or not ready yet.");
            return;
        }

        console.log("♟ AI thinking...");
        engine.postMessage(`position fen ${game.fen()}`);
        engine.postMessage("go depth 10");

        engine.onmessage = (event) => {
            console.log("Stockfish Move:", event.data);

            if (event.data.includes("bestmove")) {
                const bestMove = event.data.split("bestmove ")[1]?.split(" ")[0];
                if (bestMove) {
                    game.move({ from: bestMove.substring(0, 2), to: bestMove.substring(2, 4) });
                    setFen(game.fen());
                    setMoveHistory((prev) => [...prev, game.history().slice(-1)[0]]);
                }
            }
        };
    };

    // Function to adjust AI level
    const adjustAiLevel = (level) => {
        if (engine) {
            console.log(`🔧 Adjusting AI Level to ${level}`);
            setAiLevel(level);
            engine.postMessage(`setoption name Skill Level value ${level}`);
        }
    };

    // Function to save moves to a file
    const saveMovesToFile = () => {
        const blob = new Blob([moveHistory.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "chess_moves.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Function to abandon game
    const abandonGame = () => {
        console.log("🚨 Game abandoned. Resetting board...");
        setGame(new Chess());
        setFen(new Chess().fen());
        setMoveHistory([]);
    };

    return (
        <div className="chess-container">
            <h2>Chess Game</h2>
            
            <Chessboard position={fen} onPieceDrop={(from, to) => handleMove({ from, to })} />

            <div className="ai-controls">
                <label>AI Level:</label>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={aiLevel}
                    onChange={(e) => adjustAiLevel(e.target.value)}
                />
                <span>{aiLevel}</span>
            </div>

            <div className="move-history">
                <h3>Move History</h3>
                <div className="history-box">
                    {moveHistory.map((move, index) => (
                        <p key={index}>{index + 1}. {move}</p>
                    ))}
                </div>
                <button className="save-btn" onClick={saveMovesToFile}>Save Moves</button>
            </div>

            <div className="game-controls">
                <button className="abandon-btn" onClick={abandonGame}>Abandon Game</button>
                <button className="main-btn" onClick={goToMainPage}>Return to Main Page</button>
            </div>
        </div>
    );
};

export default ChessGame;
