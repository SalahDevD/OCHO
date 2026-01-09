const db = require('../config/database');

// Obtenir tous les clients
exports.getAllClients = async (req, res) => {
    try {
        const [clients] = await db.query(`
            SELECT 
                c.*,
                COUNT(DISTINCT cmd.id) as nombre_commandes,
                COALESCE(SUM(cmd.total), 0) as total_achats
            FROM Client c
            LEFT JOIN Commande cmd ON c.id = cmd.client_id
            WHERE c.actif = TRUE
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);
        res.json({ success: true, clients });
    } catch (error) {
        console.error('Erreur getAllClients:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Obtenir un client par ID
exports.getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const [clients] = await db.query('SELECT * FROM Client WHERE id = ?', [id]);
        
        if (clients.length === 0) {
            return res.status(404).json({ success: false, message: 'Client non trouvé' });
        }

        const [commandes] = await db.query(
            'SELECT * FROM Commande WHERE client_id = ? ORDER BY date_commande DESC',
            [id]
        );

        res.json({
            success: true,
            client: {
                ...clients[0],
                commandes
            }
        });
    } catch (error) {
        console.error('Erreur getClientById:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Créer un nouveau client
exports.createClient = async (req, res) => {
    try {
        const { nom, prenom, email, telephone, adresse, ville, code_postal } = req.body;

        if (email) {
            const [existing] = await db.query('SELECT id FROM Client WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
            }
        }

        const [result] = await db.query(
            `INSERT INTO Client (nom, prenom, email, telephone, adresse, ville, code_postal)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nom, prenom, email, telephone, adresse, ville, code_postal]
        );

        await db.query(
            'INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Création client', 'Client', result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Client créé avec succès',
            clientId: result.insertId
        });
    } catch (error) {
        console.error('Erreur createClient:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Mettre à jour un client
exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
        }

        values.push(id);

        await db.query(
            `UPDATE Client SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        await db.query(
            'INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Modification client', 'Client', id]
        );

        res.json({ success: true, message: 'Client mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur updateClient:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Désactiver un client
exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE Client SET actif = FALSE WHERE id = ?', [id]);

        await db.query(
            'INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Désactivation client', 'Client', id]
        );

        res.json({ success: true, message: 'Client désactivé avec succès' });
    } catch (error) {
        console.error('Erreur deleteClient:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
