const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
   
    paymentMethod: { type: String, required: false },
    
    cart: {type: Object, required: true},
    address: {type: String, required: true},
    name: {type: String, required: true},
});


module.exports = mongoose.model('Order', OrderSchema);
