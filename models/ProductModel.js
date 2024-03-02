import mongoose from 'mongoose';
import CustomerSchema from './Customer.js';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }, 
  quantity: {
     type: Number,
     required: true
  }, 
  image: String,
  favorite: {
     type: Boolean,
     required: false
  }
});


// Check if the model exists before compiling it
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
