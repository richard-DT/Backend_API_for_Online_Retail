const express = require('express');
const router = express.Router();
const auth = require('../auth');
const orderController = require('../controllers/order');

// Create Order (Checkout)
router.post('/checkout', auth.verify, orderController.checkout);

// Get Logged-in User’s Orders
router.get('/my-orders', auth.verify, orderController.getMyOrders);

// Get All Orders (Admin)
router.get('/all-orders', auth.verify, orderController.getAllOrders);

module.exports = router;

console.log("Order routes registered");
