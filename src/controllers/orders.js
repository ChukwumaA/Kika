const mongoose = require("mongoose");
const asyncHandler = require('middleware/async');
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require('../models/cart');


// This handles Order data on the front end, how users can create order,
// Get their own orders, and delete their made orders.

//This gets all orders made by the user
exports.orders_get_all = asyncHandler(async(req, res, next) => {
  Order.find()
    .select("product quantity _id")
    .populate("product", "name")
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          return { 
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            cart: doc.cart,
            request: {
              type: "GET",
              url: "http://localhost:8080/orders/" + doc._id
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

//This creates an order
//I'm trying to tweak it to take the information of cart
//i have imported the cart model, which will be in th eorder database that each user creates.
exports.orders_create_order = asyncHandler(async(req, res, next) => {
  Product.findById(req.body.productId)
  Cart.findById(req.body.cartId)
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
        cart: req.body.cartId,
      });
      return order.save();
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Order stored",
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity,
          cart: result.cart,
        },
        request: {
          type: "POST",
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});


//This get a particular order from the database
exports.orders_get_order = asyncHandler(async(req, res, next) => {
  Order.findById(req.params.orderId)
    .populate("product")
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }
      res.status(200).json({
        order: order,
        request: {
          type: "GET",
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

//This produces the order unique to each user
exports.my_Orders = asyncHandler(async (req, res, next) =>{
  const myOrders = await Order.find({user: req.user_id});
  res.send(myOrders);
});

//This deletes a users created order from the database
//When the user no longer wants to purchase after proceeding to check out and inputted card details
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

