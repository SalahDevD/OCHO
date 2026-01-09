const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('✓ Express importé');
console.log('✓ Cors importé');
console.log('✓ Dotenv chargé');

const app = express();

console.log('✓ App créée');

app.use(cors());
app.use(express.json());

console.log('✓ Middleware de base appliqué');

// Tester l'import des routes
try {
    const authRoutes = require('./routes/authRoutes');
    console.log('✓ authRoutes importées');
} catch (e) {
    console.error('❌ Erreur authRoutes:', e.message);
}

try {
    const productRoutes = require('./routes/productRoutes');
    console.log('✓ productRoutes importées');
} catch (e) {
    console.error('❌ Erreur productRoutes:', e.message);
}

try {
    const clientRoutes = require('./routes/clientRoutes');
    console.log('✓ clientRoutes importées');
} catch (e) {
    console.error('❌ Erreur clientRoutes:', e.message);
}

try {
    const commandeRoutes = require('./routes/commandeRoutes');
    console.log('✓ commandeRoutes importées');
} catch (e) {
    console.error('❌ Erreur commandeRoutes:', e.message);
}

try {
    const dashboardRoutes = require('./routes/dashboardRoutes');
    console.log('✓ dashboardRoutes importées');
} catch (e) {
    console.error('❌ Erreur dashboardRoutes:', e.message);
}

console.log('✓ Toutes les routes importées avec succès!');

// Route simple
app.get('/', (req, res) => {
    res.json({ message: 'Test OK' });
});

const PORT = process.env.PORT || 3000;
console.log(`Écoute sur le port ${PORT}...`);

try {
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Serveur démarré sur http://0.0.0.0:${PORT}`);
        console.log(`Accessible à: http://localhost:${PORT}/`);
    });

    server.on('error', (err) => {
        console.error('❌ Erreur serveur:', err);
    });

    server.on('listening', () => {
        console.log('📡 Serveur en écoute sur 0.0.0.0:' + PORT);
    });

    console.log('✓ app.listen() appelé avec 0.0.0.0');
} catch (e) {
    console.error('❌ Erreur lors du démarrage:', e);
}
