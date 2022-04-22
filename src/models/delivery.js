const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({

  _id: mongoose.Schema.Types.ObjectId,

  deliveryAddress: {
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  noticableLandmarks: {type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  }, 

  order:  { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true},

  paymentMethod: { type: String, required: false },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
  },

  //user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },

    //These prices should be handled by the product model, on delivery
    //No user should fill this in, they could pay less than the required 
    //Cost of the product.
    //All this should be fixed, in the sense that
    //The unique vendor will set this to his discretion.
  
    /* The COMMENTS ABOVE FOR FOR THSE SCHEMA BELOW
  itemsPrice: { type: Number, required: true },
  deliveryPrice: { type: Number, required: true },
  taxPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  */
},
{
  timestamps: true,
}
);
const delivery = mongoose.model('delivery', deliverySchema);
module.exports = delivery;