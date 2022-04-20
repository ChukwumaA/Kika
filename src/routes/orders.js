const express = require("express");

const {
    orders_get_all,
    orders_create_order,
    orders_get_order,
    orders_delete_order
} = require('../controllers/orders');

const router = express.Router();

const { protect } = require('middleware/auth');
  
// Handle incoming GET requests to /orders

router.get('/', protect, orders_get_all);
router.post('/', protect, orders_create_order);
router.get('/:orderId', protect, orders_get_order);
router.delete('/:orderId', protect,  orders_delete_order);


module.exports = router;
