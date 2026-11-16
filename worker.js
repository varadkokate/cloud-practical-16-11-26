const express = require("express");
const os = require("os");

const app = express();
const id = process.env.WORKER_ID || "1";
const port = Number(process.env.WORKER_PORT || 4001);

app.get("/", (req, res) => {
  res.json({
    message: "Request successfully handled by a website instance.",
    instanceId: Number(id),
    port,
    hostname: os.hostname(),
    status: "running"
  });
});

app.get("/health", (req, res) => res.json({ status: "ok", instanceId: Number(id) }));

app.listen(port, "127.0.0.1", () => {
  console.log(`Website instance ${id} running on port ${port}`);
});
