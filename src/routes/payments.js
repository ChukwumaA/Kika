const express = require('express');
const { chargeCard, charge_ng_acct } = require('controllers/payments');
const { checkout } = require('../controllers/cart')
const router = express.Router();

router.post('/fromCard/flutterwave', chargeCard);
router.post('/fromBank/flutterwave', charge_ng_acct);
router.post('/checkout', checkout) // This takes the logic from cart, which redirects to payments, so i thought i would be befitting it comes from payment.js

module.exports = router;
