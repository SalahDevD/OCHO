const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

console.log('[START] Creating full-featured OCHO server...');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('[OK] Middleware configured');

// Serve static files from frontend
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
console.log('[OK] Static files configured from:', frontendPath);

// Import API routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const clientRoutes = require('./routes/clientRoutes');
const commandeRoutes = require('./routes/commandeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

console.log('[OK] API routes imported');

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/dashboard', dashboardRoutes);

console.log('[OK] API routes registered');

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// API test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});

// 404 handler for API
app.use((req, res) => {
    if (req.url.startsWith('/api/')) {
        res.status(404).json({ success: false, message: 'API endpoint not found' });
    } else {
        res.sendFile(path.join(frontendPath, 'index.html'));
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(500).json({ 
        success: false, 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
console.log(`[START] Listening on port ${PORT}...`);

const server = app.listen(PORT, '::', () => {
    console.log(`[SUCCESS] ✅ OCHO Server running on http://localhost:${PORT}`);
    console.log(`[SUCCESS] ✅ Frontend: http://localhost:${PORT}/`);
    console.log(`[SUCCESS] ✅ API: http://localhost:${PORT}/api/`);
});

server.on('error', (err) => {
    console.error('[ERROR] Server error:', err.message);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught exception:', err);
    process.exit(1);
});

// Keep process alive
setTimeout(() => {}, 1000000);
