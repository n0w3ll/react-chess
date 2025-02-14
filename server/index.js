const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173"}});

io.on("connection", (socket) => {
    socket.on("move", (move) => {
        socket.broadcast.emit("move", move);
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));