const express = require('express');
const advancedResults = require('middleware/advancedResults');
const Order = require('models/Order');

const {
  createOrder,
  getAllOrders,
  getOrder,
  deleteOrder,
  getOrdersByUser,
  getUserOrders,
} = require('../controllers/orders');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, authorize('admin'), advancedResults(Order), getAllOrders)
  .post(protect, authorize('user'), createOrder);

router.route('/mine').get(protect, authorize('user'), getUserOrders);

router.route('/user/:userId').get(protect, authorize('admin'), getOrdersByUser);

router.route('/:id').get(getOrder).delete(authorize('admin'), deleteOrder);

module.exports = router;
