const express = require('express');

const {
  createOrder,
  getUserOrders,
  userOrders,
  findOrderById,
  makeDelivery,
  makePayment,
  deleteOrder,
} = require('../controllers/order');

const { chargeCard, charge_ng_acct } = require('controllers/payments');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getUserOrders);
router.post('/', protect, authorize('user'), createOrder);

router.get('/getuserorder', userOrders);
router.get('/:id', findOrderById);
router.put('/:id/deliver', makeDelivery);
router.put('/:id/pay', makePayment);

router.post('/payment/payWithCard', chargeCard);
router.post('/payment/payWithBankTransfer', charge_ng_acct);

router.delete('/deleteorder', deleteOrder);

module.exports = router;

// router.get('/getallOrders', protect, authorize, orders_get_all);
// router.post('/createOrder', protect, orders_create_order);
// router.get('/myOrders', protect, my_Orders);
// router.get('/:orderId', protect,orders_get_order);
// router.delete('/:orderId', protect, orders_delete_order);
