const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Toutes les routes nécessitent authentification + rôle Administrateur
router.use(authMiddleware);
router.use(checkRole('Administrateur'));

// Routes CRUD utilisateurs
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.put('/:id/status', userController.updateUserStatus);

module.exports = router;
