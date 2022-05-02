const express = require('express');
const advancedResults = require('middleware/advancedResults');
const Order = require('models/Order');

const {
  createOrder,
  getAllOrders,
  getOrder,
  deleteOrder,
  // userOrders,
} = require('../controllers/order');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get(
  '/',
  protect,
  authorize('admin'),
  advancedResults(Order),
  getAllOrders
);
router.post('/', protect, authorize('user'), createOrder);

router.get('/:id', getOrder);

router.delete('/deleteorder', deleteOrder);

// router.get('/getuserorder', userOrders);

module.exports = router;

// router.get('/getallOrders', protect, authorize, orders_get_all);
// router.post('/createOrder', protect, orders_create_order);
// router.get('/myOrders', protect, my_Orders);
// router.get('/:orderId', protect,orders_get_order);
// router.delete('/:orderId', protect, orders_delete_order);
