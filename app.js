const activeCount = document.getElementById("active-count");
const workersEl = document.getElementById("workers");
const notice = document.getElementById("notice");
const up = document.getElementById("up");
const down = document.getElementById("down");

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function refresh() {
  try {
    const data = await request("/api/status");
    activeCount.textContent = data.activeInstances;
    workersEl.innerHTML = "";
    data.workers.forEach(worker => {
      const card = document.createElement("div");
      card.className = "worker";
      const symbol = document.createElement("div");
      symbol.className = "symbol";
      symbol.textContent = "▣";
      const title = document.createElement("b");
      title.textContent = `Instance ${worker.id}`;
      const detail = document.createElement("small");
      detail.textContent = `${worker.status} · port ${worker.port}`;
      card.append(symbol, title, detail);
      workersEl.appendChild(card);
    });
    up.disabled = data.activeInstances >= data.maxInstances;
    down.disabled = data.activeInstances <= 1;
    notice.textContent = `Controller is healthy. ${data.activeInstances} worker instance(s) currently active.`;
  } catch (error) {
    notice.textContent = error.message;
  }
}

up.addEventListener("click", async () => {
  try {
    const data = await request("/api/scale-up", { method: "POST" });
    notice.textContent = data.message;
    await new Promise(resolve => setTimeout(resolve, 250));
    await refresh();
  } catch (error) { notice.textContent = error.message; }
});

down.addEventListener("click", async () => {
  try {
    const data = await request("/api/scale-down", { method: "POST" });
    notice.textContent = data.message;
    await new Promise(resolve => setTimeout(resolve, 250));
    await refresh();
  } catch (error) { notice.textContent = error.message; }
});

document.getElementById("refresh").addEventListener("click", refresh);

document.getElementById("visit").addEventListener("click", async () => {
  const output = document.getElementById("response");
  output.textContent = "Sending request…";
  try {
    const data = await request("/api/visit");
    output.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    output.textContent = error.message;
  }
});

refresh();
setInterval(refresh, 3000);
