async function fetchStatus() {
    try {
        const response = await fetch('/api/status');
        
        // Safety check to ensure server returned JSON and not an HTML fallback
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server returned non-JSON response.");
        }

        const data = await response.json();
        document.getElementById('instance-count').textContent = data.instances;
        document.getElementById('system-status').textContent = data.status;
        document.getElementById('system-load').textContent = data.load;
    } catch (err) {
        console.error('Failed to fetch status:', err);
    }
}

document.getElementById('provision-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/provision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        document.getElementById('output').textContent = data.message;
        fetchStatus();
    } catch (err) {
        document.getElementById('output').textContent = 'Error provisioning instance.';
    }
});

document.getElementById('scale-up-btn').addEventListener('click', async () => {
    try {
        const currentCount = parseInt(document.getElementById('instance-count').textContent) || 1;
        const response = await fetch('/api/scale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instances: currentCount + 1 })
        });
        const data = await response.json();
        document.getElementById('output').textContent = data.message;
        fetchStatus();
    } catch (err) {
        document.getElementById('output').textContent = 'Error scaling up.';
    }
});

// Initial fetch and polling
fetchStatus();
setInterval(fetchStatus, 5000);
