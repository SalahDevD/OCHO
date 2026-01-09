const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes API
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const clientRoutes = require('./routes/clientRoutes');
const commandeRoutes = require('./routes/commandeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes'); 


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Route de test
app.get('/api', (req, res) => {
    res.json({ 
        message: 'Bienvenue sur l\'API OCHO 🚀',
        version: '1.0.0',
        status: 'active',
        endpoints: {
            auth: '/api/auth (login, register)',
            products: '/api/products',
            clients: '/api/clients',
            commandes: '/api/commandes',
            dashboard: '/api/dashboard'
        }
    });
});

// Test connexion base de données
app.get('/api/test-db', async (req, res) => {
    try {
        const db = require('./config/database');
        const [rows] = await db.query('SELECT COUNT(*) as total FROM Produit');
        res.json({ 
            success: true,
            message: 'Connexion DB réussie', 
            total_produits: rows[0].total 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur connexion DB', 
            details: error.message 
        });
    }
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Erreur serveur interne',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Démarrage serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Serveur OCHO démarré avec succès!');
});
