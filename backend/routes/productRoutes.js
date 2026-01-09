const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// Routes spéciales d'abord (routes sans paramètres dynamiques)
router.get('/categories/all', productController.getCategories);

// Routes dynamiques après
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', checkRole('Administrateur', 'Magasinier'), productController.createProduct);
router.put('/:id', checkRole('Administrateur', 'Magasinier'), productController.updateProduct);
router.delete('/:id', checkRole('Administrateur'), productController.deleteProduct);

module.exports = router;
