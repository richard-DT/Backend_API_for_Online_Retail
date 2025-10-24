// routes/product.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const auth = require('../auth');

// Create Product - Admin only
router.post('/', auth.verify, auth.verifyAdmin, productController.createProduct);

// Retrieve all products - Admin only
router.get('/all', auth.verify, auth.verifyAdmin, productController.getAllProducts);

// Retrieve all active products - open to all
router.get('/active', productController.getActiveProducts);

// Retrieve single product by ID - open to all
router.get('/:productId', productController.getProductById);

// Update Product (Admin only)
router.patch('/:productId/update', auth.verify, auth.verifyAdmin, productController.updateProduct);

// Archive Product (Admin only)
router.patch('/:productId/archive', auth.verify, auth.verifyAdmin, productController.archiveProduct);

// Activate Product (Admin only)
router.patch('/:productId/activate', auth.verify, auth.verifyAdmin, productController.activateProduct);

// Search product by name
router.post('/search-by-name', productController.searchByName);

// Search products by price range
router.post('/search-by-price', productController.searchByPrice);

module.exports = router;