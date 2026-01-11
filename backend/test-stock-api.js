const http = require('http');

// Create a product with stock
const data = JSON.stringify({
    reference: 'TEST-STOCK-' + Date.now(),
    nom: 'Test Product with Stock',
    categorie_id: 1,
    genre: 'Homme',
    prix_achat: 100,
    prix_vente: 150,
    stock: 50
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/products',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBvY2hvLmNvbSIsInJvbGUiOiJBZG1pbmlzdHJhdGV1ciJ9.test'
    }
};

const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', responseData);
        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
    process.exit(1);
});

req.write(data);
req.end();
