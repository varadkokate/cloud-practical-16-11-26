const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock state for provisioning/scaling
let systemState = {
    instances: 2,
    status: 'Running',
    load: '45%'
};

// API: Get System Status
app.get('/api/status', (req, res) => {
    res.json(systemState);
});

// API: Scale Instances
app.post('/api/scale', (req, res) => {
    const { instances } = req.body;
    if (typeof instances === 'number' && instances >= 0) {
        systemState.instances = instances;
        systemState.status = 'Scaled';
        res.json({ success: true, message: `Successfully scaled to ${instances} instances`, state: systemState });
    } else {
        res.status(400).json({ success: false, error: 'Invalid instances value' });
    }
});

// API: Provision New Instance
app.post('/api/provision', (req, res) => {
    systemState.instances += 1;
    systemState.status = 'Provisioned New Node';
    res.json({ success: true, message: 'New instance provisioned successfully', state: systemState });
});

// CRITICAL FIX: Ensure unknown /api/ routes return JSON instead of HTML index page
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// Catch-all route to serve the frontend single-page app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
