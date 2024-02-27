import mongoose from 'mongoose';
const { Schema } = mongoose;
import bcrypt from 'bcrypt';

const CustomerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  purchases: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    amount: { type: Number, required: true },
  }]
});

CustomerSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

CustomerSchema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

// Check if the model exists before compiling it
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

export default Customer;