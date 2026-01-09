const http = require('http');
const path = require('path');
const fs = require('fs');

console.log('[START] Creating HTTP server...');

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
    console.log(`[LOG] ${req.method} ${req.url}`);
    
    // API endpoints (JSON)
    if (req.url.startsWith('/api/')) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API endpoint not implemented in this server' }));
        return;
    }
    
    // Serve frontend files
    let filePath = path.join(__dirname, '..', 'frontend', req.url === '/' ? 'index.html' : req.url);
    
    // Prevent directory traversal
    if (!filePath.startsWith(path.join(__dirname, '..'))) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }
    
    // Check if file exists
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            return;
        }
        
        const ext = path.extname(filePath);
        const mimeType = mimeTypes[ext] || 'text/plain';
        
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
});

const PORT = 5000;

server.on('error', (err) => {
    console.error('[ERROR] Server error:', err.code, err.message);
});

server.listen(PORT, '::', () => {
    console.log(`[SUCCESS] Server listening on port ${PORT}`);
});

console.log('[SETUP COMPLETE] Server initialized');

// Keep process alive
setTimeout(() => {}, 1000000);
