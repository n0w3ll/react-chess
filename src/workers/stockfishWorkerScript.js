const stockfishUrl = "/stockfish/stockfish.js"; 

const stockfish = new Worker(stockfishUrl, { type: "module" });

stockfish.onmessage = (e) => {
  console.log("Stockfish Worker:", e.data);
  postMessage(e.data);
};

onmessage = (e) => {
  console.log("Main Thread Msg:", e.data);
  stockfish.postMessage(e.data);
};
