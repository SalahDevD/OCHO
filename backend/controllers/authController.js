const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Inscription d'un nouvel utilisateur
exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe, role_id, telephone, adresse, ville, code_postal } = req.body;

        // Vérifier si l'email existe déjà
        const [existing] = await db.query('SELECT id FROM Utilisateur WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        // Insérer l'utilisateur
        const [userResult] = await db.query(
            'INSERT INTO Utilisateur (nom, email, mot_de_passe, role_id) VALUES (?, ?, ?, ?)',
            [nom, email, hashedPassword, role_id || 3]
        );

        // Si l'utilisateur s'inscrit comme Client (role_id = 3), créer un enregistrement Client
        const userRoleId = role_id || 3;
        if (userRoleId === 3) {
            try {
                await db.query(
                    'INSERT INTO Client (nom, prenom, email, telephone, adresse, ville, code_postal) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [nom, prenom || '', email, telephone || '', adresse || '', ville || '', code_postal || '']
                );
                console.log('Client record created for:', email);
            } catch (clientError) {
                console.error('Erreur création Client:', clientError);
                // Continue anyway, the Utilisateur record was created
            }
        }

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            userId: userResult.insertId
        });
    } catch (error) {
        console.error('Erreur register:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Connexion
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Récupérer l'utilisateur avec son rôle
        const [users] = await db.query(
            `SELECT u.*, r.nom as role_nom 
             FROM Utilisateur u 
             JOIN Role r ON u.role_id = r.id 
             WHERE u.email = ? AND u.actif = true`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }

        const user = users[0];

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.mot_de_passe);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role_nom },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        // Logger la connexion
        await db.query(
            'INSERT INTO LogsSysteme (utilisateur_id, action, details) VALUES (?, ?, ?)',
            [user.id, 'Connexion', `Connexion réussie pour ${user.email}`]
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                role: user.role_nom
            }
        });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Vérifier le token
exports.verifyToken = async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
};
