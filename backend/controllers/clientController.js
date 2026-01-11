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
// Obtenir le profil client de l'utilisateur actuel
exports.getMyProfile = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const userId = req.user.id;
        
        console.log(`🔍 Finding client profile for user: ${userEmail} (ID: ${userId})`);

        // Chercher le client par email
        const [clients] = await db.query(
            'SELECT * FROM Client WHERE email = ? AND actif = TRUE',
            [userEmail]
        );

        if (clients.length > 0) {
            console.log('✓ Client found by email:', clients[0]);
            return res.json({ success: true, client: clients[0], foundBy: 'email' });
        }

        // Si pas trouvé par email, chercher par nom
        const [userInfo] = await db.query(
            'SELECT nom FROM Utilisateur WHERE id = ?',
            [userId]
        );

        if (userInfo.length > 0 && userInfo[0].nom) {
            const [clientsByName] = await db.query(
                'SELECT * FROM Client WHERE nom = ? AND actif = TRUE LIMIT 1',
                [userInfo[0].nom]
            );

            if (clientsByName.length > 0) {
                console.log('✓ Client found by name:', clientsByName[0]);
                return res.json({ success: true, client: clientsByName[0], foundBy: 'name' });
            }
        }

        // Dernière tentative: retourner le premier client disponible
        const [firstClient] = await db.query(
            'SELECT * FROM Client WHERE actif = TRUE ORDER BY created_at DESC LIMIT 1'
        );

        if (firstClient.length > 0) {
            console.log('⚠ Using first available client:', firstClient[0]);
            return res.json({ success: true, client: firstClient[0], foundBy: 'first_available' });
        }

        console.error('✗ No clients found in system');
        res.status(404).json({ 
            success: false, 
            message: 'Aucun profil client trouvé',
            debug: {
                userEmail,
                userId,
                clientsInSystem: false
            }
        });
    } catch (error) {
        console.error('Erreur getMyProfile:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};