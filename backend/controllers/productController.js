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

// Obtenir les produits d'un vendeur spécifique
exports.getProductsByVendor = async (req, res) => {
    try {
        const { vendeurId } = req.params;
        
        // Vérifier que l'utilisateur accède à ses propres produits ou qu'il est admin
        if (req.user.role !== 'Administrateur' && req.user.id.toString() !== vendeurId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Non autorisé' 
            });
        }

        const [products] = await db.query(`
            SELECT 
                p.*,
                c.nom as categorie_nom,
                COUNT(DISTINCT v.id) as nombre_variantes,
                SUM(v.quantite) as stock_total
            FROM Produit p
            LEFT JOIN Categorie c ON p.categorie_id = c.id
            LEFT JOIN Variante v ON p.id = v.produit_id
            WHERE p.vendeur_id = ? AND p.actif = true
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `, [vendeurId]);

        res.json({ success: true, products });
    } catch (error) {
        console.error('Erreur getProductsByVendor:', error);
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
            stock,
            description,
            image_url,
            variantes
        } = req.body;

        console.log('Creating product with data:', { reference, nom, stock, prix_achat, prix_vente, image_url });

        // Insérer le produit sans stock (stock sera géré via variantes)
        const [result] = await db.query(
            `INSERT INTO Produit 
            (reference, nom, categorie_id, genre, saison, prix_achat, prix_vente, seuil_min, description, image_url, vendeur_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [reference, nom, categorie_id, genre, saison || 'Toute saison', prix_achat, prix_vente, seuil_min || 10, description || '', image_url || '', req.user.id]
        );

        const productId = result.insertId;

        // Si un stock est fourni et pas de variantes, créer une variante par défaut
        if (stock && stock > 0 && (!variantes || variantes.length === 0)) {
            await db.query(
                'INSERT INTO Variante (produit_id, taille, couleur, quantite) VALUES (?, ?, ?, ?)',
                [productId, 'Standard', 'Défaut', stock]
            );
        }

        // Insérer les variantes supplémentaires si fournies
        if (variantes && Array.isArray(variantes)) {
            for (const v of variantes) {
                await db.query(
                    'INSERT INTO Variante (produit_id, taille, couleur, quantite) VALUES (?, ?, ?, ?)',
                    [productId, v.taille, v.couleur, v.quantite || 0]
                );
            }
        }

        // Logger l'action
        try {
            await db.query(
                'INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id) VALUES (?, ?, ?, ?)',
                [req.user.id, 'Création produit', 'Produit', productId]
            );
        } catch (logError) {
            console.warn('Erreur logging création:', logError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Produit créé avec succès',
            productId
        });
    } catch (error) {
        console.error('Erreur createProduct:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur: ' + error.message });
    }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        console.log('Updating product:', id, 'with data:', updates);

        const fields = [];
        const values = [];

        // Extraire le stock séparément s'il existe
        const stockValue = updates.stock;
        delete updates.stock;

        // Construire la requête dynamiquement pour les autres champs
        for (const [key, value] of Object.entries(updates)) {
            if (key !== 'id' && key !== 'variantes' && key !== 'stock') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        // Mettre à jour les champs du produit
        if (fields.length > 0) {
            values.push(id);

            await db.query(
                `UPDATE Produit SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
        }

        // Gérer la mise à jour du stock via la variante par défaut
        if (stockValue !== undefined) {
            // Chercher la variante par défaut
            const [defaultVariant] = await db.query(
                'SELECT id FROM Variante WHERE produit_id = ? AND taille = ? AND couleur = ?',
                [id, 'Standard', 'Défaut']
            );

            if (defaultVariant.length > 0) {
                // Mettre à jour la variante existante
                await db.query(
                    'UPDATE Variante SET quantite = ? WHERE id = ?',
                    [stockValue, defaultVariant[0].id]
                );
            } else {
                // Créer une nouvelle variante par défaut si elle n'existe pas
                await db.query(
                    'INSERT INTO Variante (produit_id, taille, couleur, quantite) VALUES (?, ?, ?, ?)',
                    [id, 'Standard', 'Défaut', stockValue]
                );
            }
        }

        // Logger l'action
        try {
            await db.query(
                'INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id) VALUES (?, ?, ?, ?)',
                [req.user.id, 'Modification produit', 'Produit', id]
            );
        } catch (logError) {
            console.warn('Erreur logging modification:', logError.message);
        }

        res.json({ success: true, message: 'Produit mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur updateProduct:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur: ' + error.message });
    }
};

// Supprimer un produit (hard delete - permanently removes from database)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('Deleting product:', id, 'by user:', req.user.id, 'role:', req.user.role);

        // Vérifier les permissions: Admin peut supprimer tout, Employé/Magasinier ses propres produits
        if (req.user.role !== 'Administrateur') {
            const [product] = await db.query('SELECT vendeur_id FROM Produit WHERE id = ?', [id]);
            if (!product.length || product[0].vendeur_id !== req.user.id) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Vous ne pouvez supprimer que vos propres produits' 
                });
            }
        }

        // Ordre de suppression important pour respecter les contraintes de clé étrangère:
        // 1. Supprimer les lignes de commande qui référencent les variantes du produit
        // 2. Supprimer les variantes
        // 3. Supprimer le produit

        // D'abord, trouver toutes les variantes du produit
        const [variantes] = await db.query(
            'SELECT id FROM Variante WHERE produit_id = ?',
            [id]
        );

        // Supprimer les lignes de commande pour chaque variante
        if (variantes && variantes.length > 0) {
            const varianteIds = variantes.map(v => v.id);
            for (const varianteId of varianteIds) {
                await db.query('DELETE FROM LigneCommande WHERE variante_id = ?', [varianteId]);
            }
        }

        // Supprimer les variantes
        await db.query('DELETE FROM Variante WHERE produit_id = ?', [id]);

        // Supprimer le produit
        await db.query('DELETE FROM Produit WHERE id = ?', [id]);

        console.log('Product deleted successfully:', id);

        // Logger l'action (en fonction de ce qui est disponible)
        try {
            await db.query(
                'INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id) VALUES (?, ?, ?, ?)',
                [req.user.id, 'Suppression produit', 'Produit', id]
            );
        } catch (logError) {
            // Si le logging échoue, on continue quand même (pas critique)
            console.warn('Erreur logging suppression:', logError.message);
        }

        res.json({ success: true, message: 'Produit supprimé avec succès' });
    } catch (error) {
        console.error('Erreur deleteProduct:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur: ' + error.message });
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
