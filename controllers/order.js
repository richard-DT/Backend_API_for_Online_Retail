const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { errorHandler } = require('../auth');

// =====================
// 1. Create Order (Checkout)
// =====================
module.exports.checkout = (req, res) => {
  const userId = req.user.id;

  if (req.user.isAdmin) {
    return res.status(403).json({ message: "Admins cannot checkout orders" });
  }

  Cart.findOne({ userId })
    .then(cart => {
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      if (cart.cartItems.length === 0) {
        return res.status(400).json({ error: "No Items to Checkout" });
      }

      const newOrder = new Order({
        userId: userId,
        productsOrdered: cart.cartItems,
        totalPrice: cart.totalPrice
      });

      return newOrder.save()
        .then(savedOrder => {
          // Clear cart after successful order
          cart.cartItems = [];
          cart.totalPrice = 0;

          return cart.save().then(() => {
            res.status(201).json({ message: "Ordered Successfully" });
          });
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Error processing order", error: err.message });
    });
};

// =====================
// 2. Retrieve Logged-in User Orders
// =====================
module.exports.getMyOrders = (req, res) => {
  const userId = req.user.id;

  Order.find({ userId })
    .then(orders => {
      if (!orders.length) {
        return res.status(404).json({ message: "No orders found for this user" });
      }

      res.status(200).json({ orders });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Error retrieving orders", error: err.message });
    });
};

// =====================
// 3. Retrieve All Orders (Admin only)
// =====================
module.exports.getAllOrders = (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }

  Order.find({})
    .then(orders => {
      if (!orders.length) {
        return res.status(404).json({ message: "No orders found" });
      }

      res.status(200).json({ orders: orders });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Error retrieving all orders", error: err.message });
    });
};
