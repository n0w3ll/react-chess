export default function createStockfishWorker() {
  return new Worker(new URL("./stockfishWorkerScript.js", import.meta.url), { type: "module" });
}
