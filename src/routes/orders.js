const express = require("express");

const {
    create_Order,
    get_user_orders,
    user_orders,
    find_orderbyId,
    make_delivery,
    make_payment,
    delete_order
} = require('../controllers/order');

const { chargeCard, charge_ng_acct } = require('controllers/payments');

const router = express.Router();

const { protect, authorize} = require('../middleware/auth');
  
// Handle incoming GET requests to /orders
router.get('/getallorders', get_user_orders),
router.get('/getuserorder', user_orders),
router.post('/createorders', create_Order),
router.get('/:id', find_orderbyId),
router.put('/:id/deliver',  make_delivery),
router.put('/:id/pay', make_payment),
router.post('/payment/payWithCard',  chargeCard);
router.post('/payment/payWithBankTransfer',charge_ng_acct);
router.delete('/deleteorder', delete_order);


module.exports = router;








// router.get('/getallOrders', protect, authorize, orders_get_all);
// router.post('/createOrder', protect, orders_create_order);
// router.get('/myOrders', protect, my_Orders);
// router.get('/:orderId', protect,orders_get_order);
// router.delete('/:orderId', protect, orders_delete_order);


