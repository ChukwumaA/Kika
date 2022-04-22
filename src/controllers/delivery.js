//protect and authorize for only vendors
const mongoose = require("mongoose");
const asyncHandler = require('middleware/async');
const {orders_get_order} = require("../controllers/orders");
const delivery = require("../models/delivery");
const order = require("../models/Order");


exports.create_delivery_order = asyncHandler(async(req, res, next) => {
    order.findById(req.body.orderId)
    .then(order => {
        if (!order) {
            return res.status(404).json({
                message: "Order Delivery not created"
            });
        }

        const Delivery = new delivery ({
            _id : mongoose.Types.ObjectId(),
            deliveryAddress : req.body.deliveryAddress,
            order: req.body.orderId
        });
        return Delivery.save();
    })
    .then(result => {
        console.log(result);
        res.status(201).json ({
            message: "Order Delivery Created",
            createdDelivery: {
                _id: result._id,
                order: result.order,
                deliveryAddress: result.deliveryAddress
            },            
            request: {
                type: "POST",
                url: "http://localhost:8080/orders/" + result._id + result.deliveryAddress
            }
            
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }) ;  
});



exports.deliver_user_order = asyncHandler(async(req, res, next) => {
    delivery.find(orders_get_order)
        .select("delivery order _id")
        .populate("order", "name")
        .exec()
        .then(docs => {
            res.status(200).json({
              count: docs.length,
              delivery : docs.map(doc => {
                return { 
                  _id: doc._id,
                  order: doc.order,
                  request: {
                    type: "GET",
                    url: "http://localhost:8080/getdeliverydetails/" + doc._id
                  }
                };
              })
            });
          })
          .catch(err => {
            res.status(500).json({
              error: err
            });
          });
});


