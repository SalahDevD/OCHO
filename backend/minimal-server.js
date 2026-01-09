const express = require('express');
const app = express();

console.log('[START] Creating minimal Express server...');

app.get('/', (req, res) => {
    console.log('[LOG] GET /');
    res.json({ message: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
console.log(`[START] Listening on port ${PORT}...`);

const server = app.listen(PORT, '::', function() {
    console.log(`[SUCCESS] Server listening on http://[::1]:${PORT} (IPv6)`);
    console.log('[SUCCESS] Also accessible at http://localhost:' + PORT);
});

server.on('error', function(err) {
    console.error('[ERROR] Server error:', err);
    console.error('[ERROR] Code:', err.code);
    console.error('[ERROR] Message:', err.message);
});

server.on('listening', function() {
    console.log('[SUCCESS] Server is now listening');
});

// Catch all unhandled exceptions
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
    console.error('[FATAL] Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Keep console active
console.log('[SETUP COMPLETE] Now waiting for requests...');
setInterval(() => {}, 60000); // Prevent process from exiting

