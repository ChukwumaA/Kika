const express = require("express");
const {chargeCard, charge_ng_acct} = require('../controllers/payment');

const router = express.Router();



router.post("/", chargeCard);
router.post("/", charge_ng_acct);

module.exports = router;