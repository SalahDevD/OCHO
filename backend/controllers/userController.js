const db = require('../config/database');
const bcrypt = require('bcrypt');

// Obtenir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.id, u.nom, u.email, u.role_id, u.actif, u.created_at, r.nom as role_nom
            FROM Utilisateur u
            JOIN Role r ON u.role_id = r.id
            ORDER BY u.created_at DESC
        `);
        res.json({ success: true, users });
    } catch (error) {
        console.error('Erreur getAllUsers:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await db.query(`
            SELECT u.*, r.nom as role_nom
            FROM Utilisateur u
            JOIN Role r ON u.role_id = r.id
            WHERE u.id = ?
        `, [id]);
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        
        res.json({ success: true, user: users[0] });
    } catch (error) {
        console.error('Erreur getUserById:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Créer un utilisateur
exports.createUser = async (req, res) => {
    try {
        const { nom, email, mot_de_passe, role_id } = req.body;
        
        // Vérifier si l'email existe déjà
        const [existing] = await db.query('SELECT id FROM Utilisateur WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
        }
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        
        // Insérer le nouvel utilisateur
        const [result] = await db.query(
            'INSERT INTO Utilisateur (nom, email, mot_de_passe, role_id) VALUES (?, ?, ?, ?)',
            [nom, email, hashedPassword, role_id]
        );
        
        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Erreur createUser:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, email, mot_de_passe, role_id } = req.body;
        
        const updates = [];
        const values = [];
        
        if (nom) {
            updates.push('nom = ?');
            values.push(nom);
        }
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }
        if (role_id) {
            updates.push('role_id = ?');
            values.push(role_id);
        }
        if (mot_de_passe) {
            const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
            updates.push('mot_de_passe = ?');
            values.push(hashedPassword);
        }
        
        values.push(id);
        
        await db.query(
            `UPDATE Utilisateur SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        res.json({ success: true, message: 'Utilisateur mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur updateUser:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Changer le statut d'un utilisateur (actif/inactif)
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { actif } = req.body;
        
        await db.query('UPDATE Utilisateur SET actif = ? WHERE id = ?', [actif, id]);
        
        res.json({ success: true, message: 'Statut mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur updateUserStatus:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
