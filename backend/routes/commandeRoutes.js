const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commandeController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', commandeController.getAllCommandes);
router.get('/:id', commandeController.getCommandeById);
router.post('/', commandeController.createCommande);
router.put('/:id/valider', commandeController.validerCommande);
router.put('/:id/statut', commandeController.updateStatut);

module.exports = router;
