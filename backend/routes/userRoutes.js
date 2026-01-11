const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);

// Routes accessibles à tous (profil personnel)
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.put('/:id/avatar', userController.updateAvatar);
router.put('/:id/password', userController.updatePassword);

// Route pour mettre à jour la dernière connexion (utilisée après login)
router.put('/:id/last-login', userController.updateLastLogin);

// Routes admin (nécessitent le rôle Administrateur)
router.get('/', checkRole('Administrateur'), userController.getAllUsers);
router.post('/', checkRole('Administrateur'), userController.createUser);
router.put('/:id/status', checkRole('Administrateur'), userController.updateUserStatus);

module.exports = router;