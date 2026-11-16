# Website Provisioning & Scaling (No Docker / Kubernetes)

A beginner-friendly Cloud Computing practical using Node.js and Express.

## What it demonstrates

- **Provisioning:** the controller starts additional Node.js worker processes.
- **Scaling up:** the dashboard starts another worker process (up to 5).
- **Scaling down:** the dashboard stops one worker process (at least 1 remains).
- **Load balancing:** `/api/visit` forwards requests to active workers using round-robin selection.
- **Monitoring:** the dashboard reads live worker status from `/api/status`.

## Requirements

- Node.js 18 or newer (Node 20 LTS recommended)
- npm

## Run in Codenvy

Open the project terminal in the project folder:

```bash
npm install
npm start
```

Open the workspace preview / exposed port **3000**.

The controller starts two worker processes automatically. Worker ports are 4001–4005.

## Demonstrate the practical

1. Open the dashboard on port 3000.
2. Show the two active instances.
3. Click **Provision / Scale Up**. A new Node.js worker process starts.
4. Click **Send test request** several times. The response shows which instance handled each request.
5. Click **Scale Down**. The last active worker is stopped.
6. Use **Refresh status** or wait for the dashboard to refresh.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/status` | Read active worker status |
| POST | `/api/scale-up` | Start one worker process |
| POST | `/api/scale-down` | Stop one worker process |
| GET | `/api/visit` | Send a request through round-robin routing |
| GET | `/health` | Not used by this demo; worker health endpoint is available directly on its port |

## How it works

`server.js` is the controller and serves the dashboard. It starts and stops separate Node.js child processes by running `worker.js` on different local ports. The controller forwards test requests to active workers in round-robin order.

## Important limitations

This project demonstrates provisioning and scaling of **application processes on one machine/workspace**. It does not create separate cloud virtual machines, and it does not provide production-grade load balancing, high availability, or automatic scaling based on CPU or traffic. For real cloud infrastructure provisioning, a cloud provider or orchestration platform is required.
