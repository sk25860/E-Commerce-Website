import mongoose from 'mongoose';

const ProductModelSchema = new mongoose.Schema({
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
     type: String,
     required: false
  }
});

// Check if the model exists before compiling it
const ProductModel = mongoose.models.ProductModel || mongoose.model('ProductModel', ProductModelSchema);

export default ProductModel;
