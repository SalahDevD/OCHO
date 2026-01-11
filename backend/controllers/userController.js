const db = require('../config/database');
const bcrypt = require('bcrypt');

// Obtenir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.id, u.nom, u.email, u.role_id, u.avatar, u.bio, u.actif, 
                   u.derniere_connexion, u.created_at, r.nom as role_nom
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
        
        const user = users[0];
        
        // Ne pas envoyer le mot de passe
        delete user.mot_de_passe;
        
        res.json({ success: true, user });
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
        const { nom, email, bio, role_id } = req.body;
        
        console.log('Mise à jour utilisateur:', { id, nom, email, bio, role_id });
        
        const updates = [];
        const values = [];
        
        if (nom !== undefined) {
            updates.push('nom = ?');
            values.push(nom);
        }
        if (email !== undefined) {
            updates.push('email = ?');
            values.push(email);
        }
        if (bio !== undefined) {
            updates.push('bio = ?');
            values.push(bio);
        }
        if (role_id !== undefined) {
            updates.push('role_id = ?');
            values.push(role_id);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour' });
        }
        
        // Ajouter updated_at
        updates.push('updated_at = CURRENT_TIMESTAMP');
        
        values.push(id);
        
        const query = `UPDATE Utilisateur SET ${updates.join(', ')} WHERE id = ?`;
        console.log('Query:', query, 'Values:', values);
        
        const [result] = await db.query(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        
        res.json({ success: true, message: 'Utilisateur mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur updateUser:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur: ' + error.message });
    }
};

// Mettre à jour l'avatar utilisateur
exports.updateAvatar = async (req, res) => {
    try {
        const { id } = req.params;
        const { avatar } = req.body;
        
        console.log(`Mise à jour avatar utilisateur ${id}`);
        
        // Si avatar est null ou undefined, on le supprime
        const avatarValue = avatar || null;
        
        const [result] = await db.query(
            'UPDATE Utilisateur SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [avatarValue, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        
        res.json({ success: true, message: 'Avatar mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur updateAvatar:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de l\'avatar: ' + error.message });
    }
};

// Mettre à jour le mot de passe utilisateur
exports.updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Ancien et nouveau mot de passe requis' });
        }
        
        // Récupérer l'utilisateur actuel
        const [users] = await db.query('SELECT mot_de_passe FROM Utilisateur WHERE id = ?', [id]);
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        
        // Vérifier le mot de passe actuel
        const passwordMatch = await bcrypt.compare(currentPassword, users[0].mot_de_passe);
        
        if (!passwordMatch) {
            return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });
        }
        
        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Mettre à jour le mot de passe
        await db.query(
            'UPDATE Utilisateur SET mot_de_passe = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, id]
        );
        
        res.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur updatePassword:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Mettre à jour la dernière connexion
exports.updateLastLogin = async (userId) => {
    try {
        await db.query(
            'UPDATE Utilisateur SET derniere_connexion = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );
    } catch (error) {
        console.error('Erreur updateLastLogin:', error);
    }
};

// Changer le statut d'un utilisateur (actif/inactif)
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { actif } = req.body;
        
        await db.query(
            'UPDATE Utilisateur SET actif = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [actif, id]
        );
        
        res.json({ success: true, message: 'Statut mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur updateUserStatus:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};  