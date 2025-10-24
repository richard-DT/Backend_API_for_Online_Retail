const Cart = require('../models/Cart');
const Product = require('../models/Product');

//1. Add to Cart
module.exports.addToCart = (req, res) => {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;
    const { productId, quantity, subtotal, price } = req.body;

    // Validation
    if (isAdmin) return res.status(403).json({ error: "Admin not allowed" });
    
    // Check if product exists
    return Product.findById(productId)
        .then(product => {
            // if (!product) {
            //     return res.status(404).json({ message: "Product not found" });
            // }

            // const incomingSubtotal = product.price * quantity;

            // Find user's existing cart
            return Cart.findOne({ userId })
                .then(cart => {
                    // If no existing cart, create new one
                    if (!cart) {
                        const newCart = new Cart({
                            userId,
                            cartItems: [{
                                productId: productId,
                                quantity: quantity,
                                subtotal: subtotal
                            }],
                            totalPrice: subtotal
                        });

                        return newCart.save()
                            .then(savedCart => {
                                return res.status(201).json({
                                    message: "Item added to cart successfully",
                                    updatedCart: savedCart
                                });
                            })
                            .catch(err => res.status(500).json({
                                message: "Error saving new cart",
                                error: err.message
                            }));
                    }

                    // If cart exists, update it
                    const existingItem = cart.cartItems.find(
                        i => i.productId.toString() === productId
                    );

                    if (existingItem) {
                        existingItem.quantity += quantity;
                        existingItem.subtotal += subtotal;
                    } else {
                        cart.cartItems.push({
                            productId: productId,
                            quantity: quantity,
                            subtotal: subtotal
                        });
                    }

                    // Recalculate total price
                    cart.totalPrice = cart.cartItems.reduce((sum, i) => sum + i.subtotal, 0);

                    return cart.save()
                        .then(updatedCart => {
                            return res.status(200).json({
                                message: "Item added to cart successfully",
                                updatedCart: updatedCart
                            });
                        })
                }) 
        })
        .catch(err => res.status(500).json({
            message: "Error retrieving product details",
            error: err.message
        }));
};


// 2. Retrieve User Cart

module.exports.getCart = (req, res) => {
  const userId = req.user.id;

  Cart.findOne({ userId })
    .populate('cartItems.productId', 'name price')
    .then(cart => {
      if (!cart) {
        return res.status(200).json([]);
      }

      const formattedCart = {
        _id: cart._id,
        userId: cart.userId,
        cartItems: cart.cartItems.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
          subtotal: item.subtotal,
          _id: item._id
        })),
        totalPrice: cart.totalPrice,
        orderedOn: cart.orderedOn,
        __v: cart.__v
      };

      res.status(200).json([formattedCart]);
    })
    .catch(err => res.status(500).json({ message: "Error retrieving cart", error: err.message }));
};


// 3. Update Cart Quantity
module.exports.updateCartQuantity = (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body; //changed from newQuantity to quantity

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: 'Valid productId and quantity are required' });
  }

  Cart.findOne({ userId })
    .then(cart => {
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const item = cart.cartItems.find(i => i.productId.toString() === productId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      // Find the product to recalculate subtotal
      return Product.findById(productId)
        .then(product => {
          if (!product) {
            return res.status(404).json({ message: 'Product not found' });
          }

          // Update quantity and subtotal
          item.quantity = quantity;
          item.subtotal = product.price * quantity;

          // Recalculate total price
          cart.totalPrice = cart.cartItems.reduce((sum, i) => sum + i.subtotal, 0);

          // Save updated cart
          return cart.save();
        })
        .then(updatedCart => {
              return res.status(200).send({
                message: "Item quantity updated successfully",
                updatedCart: updatedCart
              })
        });
    })
    .catch(err => {
      return res.status(500).json({
        message: 'Error updating cart',
        error: err.message
      });
    });
};

// remove from cart 
module.exports.removeFromCart = (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Login required' });

  const userId = req.user.id;
  const productId = req.params.productId;

  Cart.findOne({ userId })
    .then(cart => {
      if (!cart) return res.status(404).json({ message: 'Cart not found' });

      const itemIndex = cart.cartItems.findIndex(
        i => i.productId.toString() === productId
      );

      if (itemIndex === -1)
        return res.status(404).json({ message: 'Item not found in cart' });

      // Remove the item
      cart.cartItems.splice(itemIndex, 1);

      // Recalculate total price
      cart.totalPrice = cart.cartItems.reduce(
        (sum, i) => sum + i.subtotal,
        0
      );

      // Save the updated cart
      return cart.save();
    })
    .then(updatedCart => {
      if (!updatedCart) return; // already handled error above

      res.status(200).json({
        message: 'Item removed from cart successfully',
        updatedCart: updatedCart
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        message: 'Error removing item from cart',
        error: err.message
      });
    });
};


// Clear cart


module.exports.clearCart = (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Login required' });

  const userId = req.user.id;

  Cart.findOne({ userId })
    .then(cart => {
      if (!cart) return res.status(404).json({ message: 'Cart not found' });

      // Empty the cart
      cart.cartItems = [];
      cart.totalPrice = 0;

      return cart.save();
    })
    .then(updatedCart => {
      if (!updatedCart) return; 

      res.status(200).json({
        message: 'Cart cleared successfully',
        updatedCart: updatedCart
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        message: 'Error clearing cart',
        error: err.message
      });
    });
};