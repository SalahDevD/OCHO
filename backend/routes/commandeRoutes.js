const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commandeController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Routes spécifiques d'abord (sans paramètres dynamiques)
router.get('/vendeur/:vendeurId', commandeController.getCommandesByVendor);

// Routes générales après
router.get('/', commandeController.getAllCommandes);
router.get('/:id', commandeController.getCommandeById);
router.post('/', commandeController.createCommande);
router.post('/:id/payment', commandeController.updatePaymentStatus);
router.put('/:id/valider', commandeController.validerCommande);
router.put('/:id/statut', commandeController.updateStatut);

module.exports = router;