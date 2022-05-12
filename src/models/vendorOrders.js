const mongoose = require('mongoose');

const vendorOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    products: [
      {
        name: { type: String, required: true },
        product: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],

    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },

    totalPrice: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    deliveryAddress: {
      state: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('vendorOrder', vendorOrderSchema);
