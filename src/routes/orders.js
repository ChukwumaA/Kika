const express = require("express");

const {
    orders_get_all,
    orders_create_order,
    orders_get_order,
    my_Orders,
    orders_delete_order
} = require('../controllers/orders');



const router = express.Router();

const { protect, authorize} = require('../middleware/auth');
  
// Handle incoming GET requests to /orders

router.get('/getallOrders', protect, authorize, orders_get_all);
router.post('/createOrder', protect, orders_create_order);
router.get('/myOrders', protect, my_Orders);
router.get('/:orderId', protect,orders_get_order);
router.delete('/:orderId', protect, orders_delete_order);

module.exports = router;
