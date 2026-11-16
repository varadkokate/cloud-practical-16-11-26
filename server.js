const express = require("express");
const path = require("path");
const { spawn } = require("child_process");
const os = require("os");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const FIRST_WORKER_PORT = Number(process.env.FIRST_WORKER_PORT || 4001);
const MAX_WORKERS = 5;

const workers = new Map();
let nextWorkerId = 1;
let nextRequest = 0;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function workerList() {
  return [...workers.values()].map(w => ({
    id: w.id,
    port: w.port,
    status: w.status,
    pid: w.process.pid || null
  }));
}

function startWorker() {
  if (workers.size >= MAX_WORKERS) {
    return { error: `Maximum of ${MAX_WORKERS} instances reached.` };
  }

  const id = nextWorkerId++;
  const port = FIRST_WORKER_PORT + id - 1;
  const child = spawn(process.execPath, [path.join(__dirname, "worker.js")], {
    env: { ...process.env, WORKER_ID: String(id), WORKER_PORT: String(port) },
    stdio: ["ignore", "inherit", "inherit"]
  });

  const worker = { id, port, status: "starting", process: child };
  workers.set(id, worker);

  child.on("spawn", () => {
    worker.status = "running";
  });

  child.on("error", (err) => {
    worker.status = "error";
    console.error(`Worker ${id} error:`, err.message);
  });

  child.on("exit", () => {
    workers.delete(id);
  });

  return { worker: { id, port, status: worker.status } };
}

function stopWorker(id) {
  const worker = workers.get(Number(id));
  if (!worker) return false;
  worker.status = "stopping";
  worker.process.kill();
  return true;
}

// Start with two application instances when the controller starts.
startWorker();
startWorker();

app.get("/api/status", (req, res) => {
  res.json({
    controller: "running",
    hostname: os.hostname(),
    activeInstances: workers.size,
    maxInstances: MAX_WORKERS,
    workers: workerList()
  });
});

app.post("/api/scale-up", (req, res) => {
  const result = startWorker();
  if (result.error) return res.status(400).json(result);
  res.json({ message: "Provisioning requested.", ...result, workers: workerList() });
});

app.post("/api/scale-down", (req, res) => {
  const running = [...workers.values()].filter(w => w.status === "running");
  if (running.length <= 1) {
    return res.status(400).json({ error: "At least one instance must remain." });
  }
  const target = running[running.length - 1];
  stopWorker(target.id);
  res.json({ message: `Scale-down requested for instance ${target.id}.`, workers: workerList() });
});

// Round-robin request distribution across active worker processes.
app.get("/api/visit", async (req, res) => {
  const active = [...workers.values()].filter(w => w.status === "running");
  if (!active.length) {
    return res.status(503).json({ error: "No application instances are running." });
  }

  const selected = active[nextRequest % active.length];
  nextRequest++;

  try {
    const response = await fetch(`http://127.0.0.1:${selected.port}/`);
    const data = await response.json();
    res.json({ ...data, routedBy: "Round-robin load balancer" });
  } catch (err) {
    res.status(502).json({ error: "Selected instance is not responding." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Provisioning & Scaling dashboard: http://localhost:${PORT}`);
});
