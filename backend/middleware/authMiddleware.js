const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Récupérer le token du header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token manquant' });
        }

        const token = authHeader.split(' ')[1];

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ajouter les infos utilisateur à la requête
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Erreur auth:', error);
        return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
    }
};

module.exports = authMiddleware;
