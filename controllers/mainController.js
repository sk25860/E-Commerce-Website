import Customer from '../models/Customer.js';
import Product from '../models/ProductModel.js';
let products;



export const loginPage = async (req, res) => {
   res.render('login');
};

export const logout = (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Error during logout');
    }
    res.redirect('/');
  });
};

export const home = async (req, res) => {
  try {
    const products = await Product.find();
    let filteredProducts = products;
    if (req.query && req.query.name && req.query.priceRange) {
      filteredProducts = await filterProducts(req.query);
    }
    res.render('home', { filteredProducts, isAuthenticated: req.isAuthenticated(), req});
  } catch (error) {
    console.error(`Error loading page: ${error.message}`);
    res.status(500).send('Error loading page');
  }
};

export const cart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);

    const cartItems = [];
    for (const item of customer.cart.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        cartItems.push({
          productId: product._id,
          name: product.name,
          quantity: item.quantity,
          price: item.price,
        });
      }
    }

    res.render('cart', { cartItems, req, customer });
  } catch (error) {
    console.error(`Error loading cart: ${error.message}`);
    res.status(500).send('Error loading cart.');
  }
};

export const userPage = async (req, res) => {
   try {
    const customer = await Customer.findById(req.user._id);
    const purchaseHistory = [];
    for (const item of customer.purchases.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        purchaseHistory.push({
          productId: product._id,
          name: product.name,
          quantity: item.quantity,
          purchaseDate: item.purchaseDate, 
        });
      }
    }
    const totalCreditLeft = customer.credit;
    const totalSpent = customer.purchases.totalPrice || 0;

    res.render('user', { isAuthenticated: req.isAuthenticated(), req, customer, purchaseHistory, totalCreditLeft, totalSpent, purchase: customer.purchases});
   }
   catch (error) {
    console.error(`Error loading cart: ${error.message}`);
    res.status(500).send('Error loading cart.');
  }
};

export const filterProducts = async (req, res) => {
  try {
      const { name, priceRange, favorite } = req.query;
      const query = {};
      if (name) {
         query.name = { $regex: new RegExp(name, 'i') };
      }
      if (priceRange) {
         query.price = { $lte: parseInt(priceRange) };
      }
      if (favorite === 'true') {
         query.favorite = true;
      }

      const filteredProducts = await Product.find(query);
      res.json(filteredProducts);
   } catch (error) {
      console.error(`Error filtering products: ${error.message}`);
      res.status(500).json({ error: 'Error filtering products' });
   }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send('Product not found.');
    }

    if (product.quantity < 1) {
      req.flash('noProduct', 'Not enough quantity');
      res.redirect('/');
    }
    else {
       const customer = await Customer.findById(req.user._id);
       const existingCartItem = customer.cart.products.find(item => item.productId.equals(product._id));

       if (existingCartItem) {
         existingCartItem.quantity += 1;
       } else {
         customer.cart.products.push({
           productId: product._id,
           quantity: 1,
           price: product.price
         });
       }

       customer.cart.totalQuantity = customer.cart.products.reduce((total, item) => total + item.quantity, 0);
       customer.cart.totalPrice = customer.cart.products.reduce((total, item) => total + item.price * item.quantity, 0);

       product.quantity -= 1;
       await Promise.all([customer.save(), product.save()]);

       req.flash('cartAdd', 'Product added to cart!');

       res.redirect('/');
    }

    
  } catch (error) {
    console.error(`Error adding to cart: ${error.message}`);
    res.status(500).send('Error adding to cart.');
  }
};

export const purchase = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate('cart.products.productId');

    if (customer.cart.products.length === 0) {
      req.flash('notEnoughCart', 'Add items to cart before purchasing.');
      res.redirect('/cart');
    }

    const cartTotalPrice = customer.cart.totalPrice;

    if (customer.credit < cartTotalPrice) {
      req.flash('notEnoughCredit', 'Not enough credits to make purchase.');
      res.redirect('/cart');
    }
   
    const purchaseDate = new Date();

    const purchase = {
      products: customer.cart.products.map((cartItem) => ({
        productId: cartItem.productId._id,
        quantity: cartItem.quantity,
        price: cartItem.price,
        purchaseDate: purchaseDate,
      })),
      totalQuantity: customer.cart.totalQuantity,
      totalPrice: cartTotalPrice,
    };

    customer.purchases.products.push(...purchase.products);
    customer.purchases.totalQuantity += purchase.totalQuantity;
    customer.purchases.totalPrice += purchase.totalPrice;

    customer.credit -= cartTotalPrice;

    customer.cart.products = [];
    customer.cart.totalQuantity = 0;
    customer.cart.totalPrice = 0;

    await customer.save();
     
    req.flash('purchase', 'Purchase successful!');

    res.redirect('/'); 
  } catch (error) {
    console.error(`Error making purchase: ${error.message}`);
    res.status(500).send('Error making purchase.');
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const customer = await Customer.findById(req.user._id);

    const cartItem = customer.cart.products.find(item => item.productId.equals(productId));
    if (!cartItem) {
      return res.status(404).send('Item not found in the cart.');
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found.');
    }
     
    if (quantity > product.quantity) {
      req.flash('noProduct', 'Not enough quantity');
      res.redirect('/cart');
    }
    else {
       product.quantity -= (quantity - cartItem.quantity); 
       cartItem.quantity = quantity;


       customer.cart.totalQuantity = customer.cart.products.reduce((total, item) => total + item.quantity, 0);
       customer.cart.totalPrice = customer.cart.products.reduce((total, item) => total + item.price * item.quantity, 0);

       await Promise.all([customer.save(), product.save()]);

       req.flash('cartUpate', 'Product quantity has been updated!');

       res.redirect('/cart');
    }
     
    
  } catch (error) {
    console.error(`Error updating cart item: ${error.message}`);
    res.status(500).send('Error updating cart item.');
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const customer = await Customer.findById(req.user._id);
     
    const product = await Product.findById(productId);
    const cartItemIndex = customer.cart.products.findIndex(item => item.productId.equals(productId));
    const cartItem = customer.cart.products[cartItemIndex];
     
    product.quantity += cartItem.quantity;
    customer.cart.products.splice(cartItemIndex, 1);

    customer.cart.totalQuantity -= cartItem.quantity;
    customer.cart.totalPrice -= cartItem.price * cartItem.quantity;
          
    await Promise.all([customer.save(), product.save()]);
     
    req.flash('cartRemove', 'Product has been removed from cart!');

    res.redirect('/cart');
  } catch (error) {
    console.error(`Error removing item from cart: ${error.message}`);
    res.status(500).send('Error removing item from cart.');
  }
};

export const clearCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);

    for (const cartItem of customer.cart.products) {
      const product = await Product.findById(cartItem.productId);

      if (product) {
        product.quantity += cartItem.quantity;

        await product.save();
      }
    }

    customer.cart.products = [];
    customer.cart.totalQuantity = 0;
    customer.cart.totalPrice = 0;

    await customer.save();
     
    req.flash('cartClear', 'Cart has been cleared!');  

    res.redirect('/cart');
  } catch (error) {
    console.error(`Error clearing cart: ${error.message}`);
    res.status(500).send('Error clearing cart.');
  }
};


