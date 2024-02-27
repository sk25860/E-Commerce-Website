import ProductModel from '../models/ProductModel.js';
let products;

export const home = async (req, res) => {
  try {
    products = await ProductModel.find();
    res.render('home', { products: products});
  } catch (error) {
    console.error(`Error loading page: ${error.message}`);
    res.status(500).send('Error loading page');
  }
  
};

export const getProducts = async (req, res) => {
   
}