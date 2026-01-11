const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Récupérer le token du header
        const authHeader = req.headers.authorization;
        console.log('🔐 Auth Middleware - Header:', authHeader ? 'PRESENT' : 'MISSING');
        console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT_SET');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Token manquant ou format invalide');
            return res.status(401).json({ success: false, message: 'Token manquant' });
        }

        const token = authHeader.split(' ')[1];
        console.log('🔑 Token reçu:', token.substring(0, 20) + '...');

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token valide pour:', decoded.email);
        
        // Ajouter les infos utilisateur à la requête
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Erreur auth:', error.message);
        return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
    }
};

module.exports = authMiddleware;
