
const express = require("express");

const {
    add_to_cart,
    reduce_cart,
    remove_cartItem,
    shoppingcart,
} = require('../controllers/cart');

const router = express.Router();

const {protect} = require('../middleware/auth')

//Handling Route Request
router.get('/addtocart', add_to_cart);
router.get('/reducecart', reduce_cart);
router.get('/removecartitems', remove_cartItem);
router.get('/shoppingcart', shoppingcart);

module.exports = router;
