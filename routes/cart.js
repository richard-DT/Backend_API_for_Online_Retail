const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const auth = require('../auth');

// Retrieve User Cart
router.get('/get-cart', auth.verify, cartController.getCart);

// Add to Cart
router.post('/add-to-cart', auth.verify, cartController.addToCart);

// Update Cart Quantity
router.patch('/update-cart-quantity', auth.verify, cartController.updateCartQuantity);

// Remove Item from Cart
router.patch('/:productId/remove-from-cart', auth.verify, cartController.removeFromCart);

// Clear Cart
router.put('/clear-cart', auth.verify, cartController.clearCart);

module.exports = router;

console.log("Cart routes registered");