const db = require('../config/database');

// Obtenir toutes les commandes
exports.getAllCommandes = async (req, res) => {
    try {
        const [commandes] = await db.query(`
            SELECT 
                cmd.*,
                c.nom as client_nom,
                c.prenom as client_prenom,
                u.nom as utilisateur_nom,
                COUNT(DISTINCT lc.id) as nombre_articles
            FROM Commande cmd
            LEFT JOIN Client c ON cmd.client_id = c.id
            LEFT JOIN Utilisateur u ON cmd.utilisateur_id = u.id
            LEFT JOIN LigneCommande lc ON cmd.id = lc.commande_id
            GROUP BY cmd.id
            ORDER BY cmd.date_commande DESC
        `);
        res.json({ success: true, commandes });
    } catch (error) {
        console.error('Erreur getAllCommandes:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Obtenir une commande par ID avec ses articles
exports.getCommandeById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [commandes] = await db.query(`
            SELECT 
                cmd.*,
                c.nom as client_nom,
                c.prenom as client_prenom,
                c.email as client_email,
                c.telephone as client_telephone,
                u.nom as utilisateur_nom
            FROM Commande cmd
            LEFT JOIN Client c ON cmd.client_id = c.id
            LEFT JOIN Utilisateur u ON cmd.utilisateur_id = u.id
            WHERE cmd.id = ?
        `, [id]);
        
        if (commandes.length === 0) {
            return res.status(404).json({ success: false, message: 'Commande non trouvée' });
        }
        
        // Récupérer les articles de la commande
        const [articles] = await db.query(`
            SELECT 
                lc.*,
                p.nom as produit_nom,
                p.reference as produit_reference,
                v.taille,
                v.couleur
            FROM LigneCommande lc
            JOIN Produit p ON lc.produit_id = p.id
            JOIN Variante v ON lc.variante_id = v.id
            WHERE lc.commande_id = ?
        `, [id]);
        
        res.json({
            success: true,
            commande: {
                ...commandes[0],
                articles
            }
        });
    } catch (error) {
        console.error('Erreur getCommandeById:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Créer une nouvelle commande
exports.createCommande = async (req, res) => {
    try {
        const { client_id, articles, notes } = req.body;
        const user_id = req.user.id;
        
        if (!client_id || !articles || articles.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Client et articles requis' 
            });
        }
        
        // Générer une référence unique
        const reference = `CMD${Date.now()}`;
        
        // Calculer le total
        let total = 0;
        for (const article of articles) {
            total += article.quantite * article.prix_unitaire;
        }
        
        // Créer la commande
        const [result] = await db.query(
            `INSERT INTO Commande (reference, client_id, utilisateur_id, statut, total, notes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [reference, client_id, user_id, 'Créée', total, notes || null]
        );
        
        const commandeId = result.insertId;
        
        // Ajouter les articles
        for (const article of articles) {
            await db.query(
                `INSERT INTO LigneCommande (commande_id, variante_id, produit_id, quantite, prix_unitaire)
                 VALUES (?, ?, ?, ?, ?)`,
                [commandeId, article.variante_id, article.produit_id, article.quantite, article.prix_unitaire]
            );
        }
        
        // Logger l'action
        await db.query(
            `INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id)
             VALUES (?, ?, ?, ?)`,
            [user_id, 'Création commande', 'Commande', commandeId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Commande créée avec succès',
            commandeId,
            reference
        });
    } catch (error) {
        console.error('Erreur createCommande:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Valider une commande
exports.validerCommande = async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query(
            'UPDATE Commande SET statut = ?, updated_at = NOW() WHERE id = ?',
            ['Validée', id]
        );
        
        await db.query(
            `INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id)
             VALUES (?, ?, ?, ?)`,
            [req.user.id, 'Validation commande', 'Commande', id]
        );
        
        res.json({ success: true, message: 'Commande validée avec succès' });
    } catch (error) {
        console.error('Erreur validerCommande:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Mettre à jour le statut d'une commande
exports.updateStatut = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;
        
        const statuts_valides = ['Créée', 'Validée', 'En cours', 'Livrée', 'Annulée'];
        
        if (!statuts_valides.includes(statut)) {
            return res.status(400).json({ success: false, message: 'Statut invalide' });
        }
        
        await db.query(
            'UPDATE Commande SET statut = ?, updated_at = NOW() WHERE id = ?',
            [statut, id]
        );
        
        await db.query(
            `INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id)
             VALUES (?, ?, ?, ?)`,
            [req.user.id, 'Changement statut commande', 'Commande', id]
        );
        
        res.json({ success: true, message: 'Statut mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur updateStatut:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
