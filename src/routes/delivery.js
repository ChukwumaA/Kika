 const express = require("express");

 const {
    create_delivery_order,
    get_delivery_details,
    deliver_Orders,
    update_delivery_order
 } = require('../controllers/delivery');

 const router = express.Router();

 const {protect} = require ('../middleware/auth')

 //Handling route request
router.post('/createdelivery',  create_delivery_order);
router.patch('/updatedelivery/', update_delivery_order);
router.get('/getdeliverydetails',  get_delivery_details); //The comment above helps this
router.get('/makeDelivery', protect, deliver_Orders); // this routes ensures the order the customer made is in progress, and the time the order was made.


 module.exports = router;