//protect and authorize for only vendors
const mongoose = require("mongoose");
const asyncHandler = require('middleware/async');
const {orders_get_order} = require("../controllers/orders");
const delivery = require("models/delivery");
const order = require("models/Order");

exports.create_delivery_order = asyncHandler(async(req, res, next) => {
    order.findById(req.body.orderId)
    .then(order => {
        if (!order) { 
            return res.status(404).json({
                message: "Order to be delivered has not created"
            });
        }

        const Delivery = new delivery ({
            _id : mongoose.Types.ObjectId(),
            deliveryAddress : req.body.deliveryAddress,
            order: req.body.orderId,
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
                url: "http://localhost:8080/orders/" + result._id
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


//Also this route is exported to order.js in the routes folder
exports.get_delivery_details = asyncHandler(async(req, res, next) => {
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


//This is the logic, for updating delivery details in case of any errors

exports.update_delivery_order = asyncHandler(async(req, res, next) => {
  order.findByIdAndUpdate(req.body.orderId)
  .then(order, delivery => {
      if (!order) { 
          return res.status(404).json({
              message: "Order to be delivered has not created"
          });
      }

      //let order =  new order.updateOne(req.params)
      const Delivery = new delivery.findByIdAndUpdate(req.body)
         ({
          _id : mongoose.Types.ObjectId(),
          deliveryAddress : req.body.deliveryAddress,
          order: req.body.orderId,
      });
      Delivery.save()
      
  })
  .then(result => {
      console.log(result);
      res.status(201).json ({
          message: "Order Delivery Updated",
          updatedDelivery: {
              _id: result._id,
              order: result.order,
              deliveryAddress: result.deliveryAddress
              
          },          
          
          
          request: {
              type: "PATCH",
              url: "http://localhost:8080/orders/" + result._id
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

//This route is exported to order.js, in the routes folder  
exports.deliver_Orders = asyncHandler(async (req, res) => {
  const makeDelivery =  await delivery.findById(req.params.id);

   if(makeDelivery) {
     makeDelivery.isDelivered = true;
     makeDelivery.deliveredAt = Date.now();
     await makeDelivery.save(req.params);
     res.send({message: "Delivery is in Progress"});
   }
   else {
     res.status(404).send({message: "Delivery details not found"})
   }
});

exports.orders_delete_order = asyncHandler(async(req, res, next) => {
  Order.remove({ _id: req.params.orderId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Order deleted",
        request: {
          type: "DELETE",
          body: { productId: "ID", quantity: "Number" }
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

