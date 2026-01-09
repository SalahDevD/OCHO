const db = require('../config/database');

// Statistiques du dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        // Total des produits actifs
        const [produits] = await db.query(
            'SELECT COUNT(*) as total FROM Produit WHERE actif = TRUE'
        );
        
        // Total des clients actifs
        const [clients] = await db.query(
            'SELECT COUNT(*) as total FROM Client WHERE actif = TRUE'
        );
        
        // Valeur du stock
        const [valeurStock] = await db.query(`
            SELECT COALESCE(SUM(p.prix_vente * v.quantite), 0) as valeur
            FROM Produit p
            JOIN Variante v ON p.id = v.produit_id
            WHERE p.actif = TRUE
        `);
        
        // Commandes du mois
        const [commandesMois] = await db.query(`
            SELECT 
                COUNT(*) as nombre,
                COALESCE(SUM(total), 0) as chiffre_affaires
            FROM Commande
            WHERE MONTH(date_commande) = MONTH(CURRENT_DATE())
            AND YEAR(date_commande) = YEAR(CURRENT_DATE())
        `);
        
        // Stock total
        const [stockTotal] = await db.query(
            'SELECT COALESCE(SUM(quantite), 0) as total FROM Variante'
        );
        
        // Produits avec stock faible
        const [stockFaible] = await db.query(`
            SELECT COUNT(DISTINCT p.id) as total
            FROM Produit p
            JOIN Variante v ON p.id = v.produit_id
            WHERE p.actif = TRUE AND v.quantite < p.seuil_min
        `);
        
        // Top 5 produits les plus vendus
        const [topProduits] = await db.query(`
            SELECT 
                p.id,
                p.nom,
                p.reference,
                COALESCE(SUM(lc.quantite), 0) as quantite_vendue,
                COALESCE(SUM(lc.quantite * lc.prix_unitaire), 0) as chiffre_affaires
            FROM Produit p
            LEFT JOIN LigneCommande lc ON p.id = lc.produit_id
            WHERE p.actif = TRUE
            GROUP BY p.id
            ORDER BY quantite_vendue DESC
            LIMIT 5
        `);
        
        // 10 dernières commandes
        const [commandesRecentes] = await db.query(`
            SELECT 
                cmd.id,
                cmd.reference,
                cmd.statut,
                cmd.total,
                cmd.date_commande,
                c.nom as client_nom,
                c.prenom as client_prenom
            FROM Commande cmd
            LEFT JOIN Client c ON cmd.client_id = c.id
            ORDER BY cmd.date_commande DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            stats: {
                total_produits: produits[0].total,
                total_clients: clients[0].total,
                valeur_stock: valeurStock[0].valeur || 0,
                commandes_mois: commandesMois[0].nombre,
                ca_mois: commandesMois[0].chiffre_affaires,
                stock_total: stockTotal[0].total || 0,
                produits_stock_faible: stockFaible[0].total || 0,
                top_produits: topProduits,
                commandes_recentes: commandesRecentes
            }
        });
    } catch (error) {
        console.error('Erreur getDashboardStats:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Obtenir les alertes (produits avec stock faible)
exports.getAlertes = async (req, res) => {
    try {
        const [alertes] = await db.query(`
            SELECT DISTINCT
                p.id,
                p.reference,
                p.nom as produit_nom,
                p.seuil_min,
                v.id as variante_id,
                v.taille,
                v.couleur,
                v.quantite,
                CASE WHEN v.quantite = 0 THEN 'RUPTURE' 
                     WHEN v.quantite < p.seuil_min THEN 'FAIBLE'
                     ELSE 'OK' END as niveau_alerte
            FROM Produit p
            JOIN Variante v ON p.id = v.produit_id
            WHERE p.actif = TRUE AND v.quantite <= p.seuil_min
            ORDER BY v.quantite ASC
        `);

        res.json({ success: true, alertes });
    } catch (error) {
        console.error('Erreur getAlertes:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
