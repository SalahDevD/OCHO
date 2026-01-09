const http = require('http');

console.log('[START] Creating raw HTTP server...');

const server = http.createServer((req, res) => {
    console.log(`[LOG] ${req.method} ${req.url}`);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        message: 'Hello from raw HTTP',
        timestamp: new Date().toISOString()
    }));
});

const PORT = 5000;

server.on('error', (err) => {
    console.error('[ERROR] Server error:', err.code, err.message);
});

server.listen(PORT, '::', () => {
    console.log(`[SUCCESS] Raw HTTP server listening on port ${PORT}`);
});

console.log('[SETUP COMPLETE] Server initialized');

// Keep process alive
setTimeout(() => {}, 1000000);
