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

  cart: {type: Object, required: false},

  

  //user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },

    //These prices should be handled by the product model, on delivery
    //No user should fill this in, they could pay less than the required 
    //Cost of the product.
    //All this should be fixed, in the sense that
    //The unique vendor will set this to his discretion.
  
     
  //itemsPrice: { type: Number, required: true },
  deliveryPrice: { type: Number, required: false },
  taxPrice: { type: Number, required: false },
  totalPrice: { type: Number, required: false },
  
},
{
  timestamps: true,
}
);
const delivery = mongoose.model('delivery', deliverySchema);
module.exports = delivery;