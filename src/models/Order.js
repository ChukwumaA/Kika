const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Vendor',
          required: true,
        },
      },
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    deliveryAddress: {
      state: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
    },
    totalPrice: { type: Number, required: true },
    paymentInfo: {
      transactionId: { type: Number, trim: true, required: true, unique: true },
      currency: { type: String, required: true },
      gateway: {
        type: String,
        required: [true, 'Payment Gateway should be included'],
        enum: ['flutterwave'], // more can be added later
        default: 'flutterwave',
      },
      status: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['created', 'in-progress', 'delivered'],
      default: 'created',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
