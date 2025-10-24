const Product = require('../models/Product');

// 1. Create Product (Admin only)
module.exports.createProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const newProduct = new Product({ name, description, price });
    const savedProduct = await newProduct.save();

    res.status(201).json({ message: 'Product created successfully', product: savedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
};

// 2. Retrieve all products (Admin only)
module.exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json( products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};

// 3. Retrieve all active products (open to all)
module.exports.getActiveProducts = async (req, res) => {
  try {
    const activeProducts = await Product.find({ isActive: true });
    res.status(200).json(activeProducts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active products', error: err.message });
  }
};

// 4. Retrieve single product by ID (open to all)
module.exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { name, description, price } = req.body;

    // Basic validation
    if (!name && !description && !price) {
      return res.status(400).json({ message: 'At least one field is required to update.' });
    }

    // Build update object dynamically
    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (price) updates.price = price;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
    	success: true,
      	message: 'Product updated successfully'
   
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

// 6. Archive Product (Admin only)

module.exports.archiveProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find product first
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already archived
    if (!product.isActive) {
      return res.status(200).json({
        message: 'Product already archived',
        archivedProduct: product
      });
    }

    // Archive the product
    product.isActive = false;
    const archivedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product archived successfully'
    });

  } catch (err) {
    res.status(500).json({ message: 'Error archiving product', error: err.message });
  }
};

// 7. activate product
module.exports.activateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find the product first
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already active
    if (product.isActive) {
      return res.status(200).json({
        message: 'Product already active',
        activateProduct: product
      });
    }

    // Activate the product
    product.isActive = true;
    const activatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product activated successfully'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error activating product', error: err.message });
  }
};

// 8. Search Products by name
module.exports.searchByName = (req, res) => {
  const name = req.body.name;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Product name is required' });
  }

  
  Product.find({ name: { $regex: name, $options: 'i' } })
    .then(products => {
      if (!products.length) {
        return res.status(404).json({ message: 'No products found matching that name' });
      }

      // res.status(200).json({
      //   message: 'Products found',
      //   results: products
      // });
      res.status(200).json(products);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        message: 'Error searching products by name',
        error: err.message
      });
    });
};

// 9. Search Products by Price Range
module.exports.searchByPrice = (req, res) => {
  const { minPrice, maxPrice } = req.body;

  // Validate input
  if (minPrice === undefined || maxPrice === undefined) {
    return res.status(400).json({
      message: 'Both minPrice and maxPrice are required'
    });
  }

  if (isNaN(minPrice) || isNaN(maxPrice) || minPrice < 0 || maxPrice < 0) {
    return res.status(400).json({
      message: 'minPrice and maxPrice must be valid positive numbers'
    });
  }

  
  const query = {
    price: { $gte: Number(minPrice), $lte: Number(maxPrice) }
  };

  Product.find(query)
    .then(products => {
      if (!products.length) {
        return res.status(404).json({
          message: 'No products found within the specified price range'
        });
      }

      // res.status(200).json({
      //   message: 'Products found',
      //   results: products
      // });

      res.status(200).json(products);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        message: 'Error searching products by price range',
        error: err.message
      });
    });
};