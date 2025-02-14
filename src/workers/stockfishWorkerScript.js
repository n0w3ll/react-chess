const stockfishUrl = "/stockfish/stockfish.js"; // Get Stockfish file from public/

const stockfish = new Worker(stockfishUrl, { type: "module" });

stockfish.onmessage = (e) => {
  postMessage(e.data);
};

onmessage = (e) => {
  stockfish.postMessage(e.data);
};
