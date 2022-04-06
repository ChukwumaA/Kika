const express = require("express");
const {chargeCard, charge_ng_acct} = require('../controllers/payment');

const router = express.Router();



router.post("/fromCard/flutterwave", chargeCard);
router.post("/fromBank/flutterwave", charge_ng_acct);

module.exports = router;