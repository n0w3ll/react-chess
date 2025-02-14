import React, {useState, useEffect} from "react";
import {Chess} from "chess.js";
import { Chessboard } from "react-chessboard";
import io from "socket.io-client";
import createStockfishWorker from "./workers/stockfishWorker";

const socket = io("http://localhost:5000");

const ChessGame = ({ mode }) => {
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    // const [playerColor, setPlayerColor] = useState("w");
    const [engine, setEngine] = useState(null);
    const [moveHistory, setMoveHistory] = useState([]);

    useEffect(() => {
        if (mode === "ai") {
            const worker = createStockfishWorker(); 
            worker.postMessage("uci");
            setEngine(worker);
        }
    }, [mode]);

    useEffect(() => {
        if (mode === "multiplayer") {
            socket.on("move", (move) => {
                game.move(move);
                setFen(game.fen());
            });
        }
    }, [game, mode]);

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

    const makeAIMove = () => {
        if (engine) {
            engine.postMessage(`position fen ${game.fen()}`);
            engine.postMessage("go depth 10");
            engine.onmessage = (event) => {
                // console.log("Stockfish response:", event.data);
                
                if (event.data.includes("bestmove")) {
                    const bestMove = event.data.split("bestmove ")[1]?.split(" ")[0];
                    if (bestMove) {
                        game.move({ from: bestMove.substring(0, 2), to: bestMove.substring(2, 4) });
                        setFen(game.fen());
                        setMoveHistory((prev) => [...prev, game.history().slice(-1)[0]]);
                    }
                }
            };
        }
        else {
            console.error("Stockfish engine is not initialized");
        }
    };

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

    return (
        <div className="chess-container">
            <h2>Chess Game</h2>
            {/* <div className="chessboard-wrapper"> */}
                <Chessboard position={fen} onPieceDrop={(from, to) => handleMove({ from, to })} />
            {/* </div> */}

            
            <div className="move-history">
                <h3>Move History</h3>
                <div className="history-box">
                {moveHistory.map((move, index) => (
                    <p key={index}>{index + 1}. {move}</p>
                ))}
                </div>
                <button className="save-btn" onClick={saveMovesToFile}>Save Moves</button>
            </div>
            
        </div>
    );
};

export default ChessGame;