const db = require('../config/database');

// Obtenir toutes les commandes
exports.getAllCommandes = async (req, res) => {
    try {
        const [commandes] = await db.query(`
            SELECT 
                cmd.*,
                c.nom as client_nom,
                c.prenom as client_prenom,
                c.email as client_email,
                c.telephone as client_telephone,
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

// Obtenir les commandes d'un vendeur spécifique
exports.getCommandesByVendor = async (req, res) => {
    try {
        const { vendeurId } = req.params;
        
        // Vérifier si l'utilisateur a le droit de voir ces commandes
        if (req.user.role !== 'Administrateur' && req.user.id.toString() !== vendeurId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Non autorisé' 
            });
        }
        
        // Récupérer toutes les commandes qui contiennent des produits de ce vendeur
        const [commandes] = await db.query(`
            SELECT DISTINCT
                cmd.*,
                c.nom as client_nom,
                c.prenom as client_prenom,
                c.email as client_email,
                c.telephone as client_telephone
            FROM Commande cmd
            LEFT JOIN Client c ON cmd.client_id = c.id
            LEFT JOIN LigneCommande lc ON cmd.id = lc.commande_id
            LEFT JOIN Produit p ON lc.produit_id = p.id
            WHERE p.vendeur_id = ?
            ORDER BY cmd.date_commande DESC
        `, [vendeurId]);
        
        // Pour chaque commande, calculer le total spécifique au vendeur
        const commandesAvecTotalVendeur = await Promise.all(commandes.map(async (commande) => {
            // Calculer le total des produits du vendeur dans cette commande
            const [result] = await db.query(`
                SELECT SUM(lc.quantite * lc.prix_unitaire) as total_vendeur,
                       COUNT(lc.id) as nombre_articles_vendeur
                FROM LigneCommande lc
                JOIN Produit p ON lc.produit_id = p.id
                WHERE lc.commande_id = ? 
                AND p.vendeur_id = ?
            `, [commande.id, vendeurId]);
            
            return {
                ...commande,
                vendor_total: parseFloat(result[0]?.total_vendeur || 0),
                vendor_items: parseInt(result[0]?.nombre_articles_vendeur || 0),
                items_count: parseInt(result[0]?.nombre_articles_vendeur || 0)
            };
        }));
        
        res.json({ 
            success: true, 
            commandes: commandesAvecTotalVendeur 
        });
    } catch (error) {
        console.error('Erreur getCommandesByVendor:', error);
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
                p.vendeur_id,
                v.taille,
                v.couleur
            FROM LigneCommande lc
            JOIN Produit p ON lc.produit_id = p.id
            LEFT JOIN Variante v ON lc.variante_id = v.id
            WHERE lc.commande_id = ?
        `, [id]);
        
        // Si c'est un vendeur, calculer son total spécifique
        let vendor_total = 0;
        if (req.user.role === 'Employé') {
            const vendeurArticles = articles.filter(a => a.vendeur_id === req.user.id);
            vendor_total = vendeurArticles.reduce((sum, article) => {
                return sum + (article.prix_unitaire * article.quantite);
            }, 0);
        }
        
        res.json({
            success: true,
            commande: {
                ...commandes[0],
                articles,
                vendor_total,
                lignes: articles // Alias pour compatibilité avec le frontend
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
        
        console.log('Creating commande with data:', { client_id, articles, notes });
        
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
            let variante_id = article.variante_id;
            
            // Si pas de variante_id, chercher la variante par défaut
            if (!variante_id) {
                const [variants] = await db.query(
                    `SELECT id FROM Variante 
                     WHERE produit_id = ? AND taille = 'Standard' AND couleur = 'Défaut'
                     LIMIT 1`,
                    [article.produit_id]
                );
                
                if (variants.length > 0) {
                    variante_id = variants[0].id;
                } else {
                    // Sinon prendre la première variante disponible
                    const [firstVariant] = await db.query(
                        `SELECT id FROM Variante 
                         WHERE produit_id = ? 
                         LIMIT 1`,
                        [article.produit_id]
                    );
                    
                    if (firstVariant.length > 0) {
                        variante_id = firstVariant[0].id;
                    } else {
                        // Si aucune variante trouvée, retourner une erreur
                        return res.status(400).json({
                            success: false,
                            message: `Produit ${article.produit_id} n'a pas de variante disponible`
                        });
                    }
                }
            }
            
            console.log(`Adding article: produit ${article.produit_id}, variante ${variante_id}, qty ${article.quantite}`);
            
            await db.query(
                `INSERT INTO LigneCommande (commande_id, variante_id, produit_id, quantite, prix_unitaire)
                 VALUES (?, ?, ?, ?, ?)`,
                [commandeId, variante_id, article.produit_id, article.quantite, article.prix_unitaire]
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
        res.status(500).json({ success: false, message: 'Erreur serveur: ' + error.message });
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

// Mettre à jour le statut de paiement
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod, status } = req.body;

        if (!status) {
            return res.status(400).json({ 
                success: false, 
                message: 'Statut de paiement requis' 
            });
        }

        // Mettre à jour le statut de paiement
        await db.query(
            `UPDATE Commande 
             SET statut = 'Payée', 
                 payment_method = ?,
                 payment_date = NOW(),
                 updated_at = NOW() 
             WHERE id = ?`,
            [paymentMethod || 'carte', id]
        );

        // Logger l'action
        await db.query(
            `INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id, details)
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, 'Paiement commande', 'Commande', id, `Méthode: ${paymentMethod || 'carte'}`]
        );

        console.log(`✅ Paiement traité pour commande ${id} via ${paymentMethod}`);

        res.json({ 
            success: true, 
            message: 'Paiement traité avec succès',
            commandeId: id
        });
    } catch (error) {
        console.error('Erreur updatePaymentStatus:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
