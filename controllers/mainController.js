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
    const products = await ProductModel.find();
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

    console.log("Customer:", customer);

    // Manually retrieve product details for each item in the cart
    const cartItems = [];
    for (const item of customer.cart.products) {
      console.log("Item in cart:", item);
        console.log("Item productId:", item.productId);
      const product = await Product.findById(item.productId);
      console.log("Product details:", product);
      if (product) {
        cartItems.push({
          //productId: product._id,
          //name: product.name,
          quantity: item.quantity,
          price: item.price,
        });
         console.log(cartItems);
      }
    }

    console.log("Final cartItems:", cartItems);
    res.render('cart', { cartItems, req });
  } catch (error) {
    console.error(`Error loading cart: ${error.message}`);
    res.status(500).send('Error loading cart.');
  }
};


export const userPage = async (req, res) => {
   res.render('user', { isAuthenticated: req.isAuthenticated(), req});
};


export const filterProducts = async (req, res) => {
   console.log(req.query);
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

      const filteredProducts = await ProductModel.find(query);
      res.json(filteredProducts);
   } catch (error) {
      console.error(`Error filtering products: ${error.message}`);
      res.status(500).json({ error: 'Error filtering products' });
   }
};

/*export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await ProductModel.findById(productId);
     console.log(product);
    if (!product) {
      return res.status(404).send('Product not found.');
    }

    if (product.quantity < 1) {
      return res.status(400).send('Not enough quantity available.');
    }

    // Reduce the quantity of the product by 1
    product.quantity -= 1;
    await product.save();

    // Add the product to the customer's cart
    const customer = await Customer.findById(req.user._id);
    customer.cart.products.push({ productId: product, quantity: 1, price: product.price });
    await customer.save();

    res.redirect('/'); 
  } catch (error) {
    console.error(`Error adding to cart: ${error.message}`);
    res.status(500).send('Error adding to cart.');
  }
}; */

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).send('Product not found.');
    }

    if (product.quantity < 1) {
      return res.status(400).send('Not enough quantity available.');
    }

    // Reduce the quantity of the product by 1
    product.quantity -= 1;
    await product.save();

    // Add the product to the customer's cart
    const customer = await Customer.findById(req.user._id);
    customer.cart.products.push({
      productId: product._id, // Use the product's _id here
      quantity: 1,
      price: product.price
    });

    await customer.save();

    res.redirect('/');
  } catch (error) {
    console.error(`Error adding to cart: ${error.message}`);
    res.status(500).send('Error adding to cart.');
  }
};

