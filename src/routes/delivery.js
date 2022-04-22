 const express = require("express");

 const {
    create_delivery_order,
    deliver_user_order
 } = require('../controllers/delivery');

 const router = express.Router();

 const {protect} = require ('../middleware/auth')

 //Handling route request
 router.get('/getdeliverydetails',protect, deliver_user_order);
 router.post('/createdelivery', protect, create_delivery_order);
 
 module.exports = router;