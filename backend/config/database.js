const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ocho_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test de connexion au démarrage
pool.getConnection()
    .then((connection) => {
        console.log('✅ Connexion à la base de données réussie');
        connection.release();
    })
    .catch((error) => {
        console.error('❌ Erreur de connexion à la base de données:', error.message);
    });

module.exports = pool;
