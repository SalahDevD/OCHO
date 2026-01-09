const db = require('../config/database');

// Obtenir tous les produits avec leurs variantes
exports.getAllProducts = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT 
                p.*,
                c.nom as categorie_nom,
                COUNT(DISTINCT v.id) as nombre_variantes,
                SUM(v.quantite) as stock_total
            FROM Produit p
            LEFT JOIN Categorie c ON p.categorie_id = c.id
            LEFT JOIN Variante v ON p.id = v.produit_id
            WHERE p.actif = true
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `);

        res.json({ success: true, products });
    } catch (error) {
        console.error('Erreur getAllProducts:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Obtenir un produit par ID avec ses variantes
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await db.query(`
            SELECT p.*, c.nom as categorie_nom
            FROM Produit p
            LEFT JOIN Categorie c ON p.categorie_id = c.id
            WHERE p.id = ?
        `, [id]);

        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Produit non trouvé' });
        }

        const [variantes] = await db.query(
            'SELECT * FROM Variante WHERE produit_id = ?',
            [id]
        );

        res.json({
            success: true,
            product: {
                ...products[0],
                variantes
            }
        });
    } catch (error) {
        console.error('Erreur getProductById:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Créer un nouveau produit
exports.createProduct = async (req, res) => {
    try {
        const {
            reference,
            nom,
            categorie_id,
            genre,
            saison,
            prix_achat,
            prix_vente,
            seuil_min,
            variantes
        } = req.body;

        // Insérer le produit
        const [result] = await db.query(
            `INSERT INTO Produit 
            (reference, nom, categorie_id, genre, saison, prix_achat, prix_vente, seuil_min)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [reference, nom, categorie_id, genre, saison || 'Toute saison', prix_achat, prix_vente, seuil_min || 10]
        );

        const productId = result.insertId;

        // Insérer les variantes si fournies
        if (variantes && Array.isArray(variantes)) {
            for (const v of variantes) {
                await db.query(
                    'INSERT INTO Variante (produit_id, taille, couleur, quantite) VALUES (?, ?, ?, ?)',
                    [productId, v.taille, v.couleur, v.quantite || 0]
                );
            }
        }

        // Logger l'action
        await db.query(
            'INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Création produit', 'Produit', productId]
        );

        res.status(201).json({
            success: true,
            message: 'Produit créé avec succès',
            productId
        });
    } catch (error) {
        console.error('Erreur createProduct:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const fields = [];
        const values = [];

        // Construire la requête dynamiquement
        for (const [key, value] of Object.entries(updates)) {
            if (key !== 'id' && key !== 'variantes') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
        }

        values.push(id);

        await db.query(
            `UPDATE Produit SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        // Logger l'action
        await db.query(
            'INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Modification produit', 'Produit', id]
        );

        res.json({ success: true, message: 'Produit mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur updateProduct:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Désactiver un produit (soft delete)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('UPDATE Produit SET actif = false WHERE id = ?', [id]);

        // Logger l'action
        await db.query(
            'INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Désactivation produit', 'Produit', id]
        );

        res.json({ success: true, message: 'Produit désactivé avec succès' });
    } catch (error) {
        console.error('Erreur deleteProduct:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Obtenir les catégories
exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM Categorie ORDER BY nom');
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Erreur getCategories:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
