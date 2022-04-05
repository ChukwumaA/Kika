/* const express = require('express');
const { getUser } = require('controllers/users');

const router = express.Router({ mergeParams: true });

// middleware to Check user is logged in
const { protect } = require('middleware/auth');

router.use(protect);

router.route('/:id').get(getUser);

module.exports = router;
 */

const express = require('express')
const expressAsyncHandler = require('expressAsyncHandler')
const Order = require ('../models/Order')
const Buyer = require('../models/Buyers')
const Product = require('../models/Products')
const { protect, isAdmin } = require('../middleware/auth');
const { mailgun, payOrderEmailTemplate } = require('../middleware/utils');
//const { getUser } = require('controllers/users');
//const { getBuyer } = require('controllers/buyers');

const orderRouter = express.Router();

orderRouter.use(protect);

orderRouter.get(
    '/',
    isAdmin,
    expressAsyncHandler(async(req, res) => {
        const orders = await Order.find().populate('user', 'name');
        res.send(orders);
    })
);

orderRouter.post(
    '/',
    //protect,
    expressAsyncHandler(async (req, res) => {
      const newOrder = new Order({
        orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        totalPrice: req.body.totalPrice,
        user: req.user._id,
      });
  
      const order = await newOrder.save();
      res.status(201).send({ message: 'New Order Created', order });
    })
);

orderRouter.get(
    '/summary',
    //protect,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
      const orders = await Order.aggregate([
        {
          $group: {
            _id: null,
            numOrders: { $sum: 1 },
            totalSales: { $sum: '$totalPrice' },
          },
        },
      ]);
      const users = await Buyer.aggregate([
        {
          $group: {
            _id: null,
            numUsers: { $sum: 1 },
          },
        },
      ]);
      const dailyOrders = await Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orders: { $sum: 1 },
            sales: { $sum: '$totalPrice' },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      const productCategories = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]);
      res.send({ users, orders, dailyOrders, productCategories });
    })
);

orderRouter.get(
    '/mine',
    expressAsyncHandler(async (req, res) => {
      const orders = await Order.find({ user: req.user._id });
      res.send(orders);
    })
  );
  
  orderRouter.get(
    '/:id',
    expressAsyncHandler(async (req, res) => {
      const order = await Order.findById(req.params.id);
      if (order) {
        res.send(order);
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    })
);

orderRouter.put(
    '/:id/deliver',
    //isAuth,
    expressAsyncHandler(async (req, res) => {
      const order = await Order.findById(req.params.id);
      if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        await order.save();
        res.send({ message: 'Order Delivered' });
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    })
);

orderRouter.put(
    '/:id/pay',
    //isAuth,
    expressAsyncHandler(async (req, res) => {
      const order = await Order.findById(req.params.id).populate(
        'user',
        'email name'
      );
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: req.body.id,
          status: req.body.status,
          update_time: req.body.update_time,
          email_address: req.body.email_address,
        };
  
        const updatedOrder = await order.save();
        mailgun()
          .messages()
          .send(
            {
              from: 'Kika <kika@management.yourdomain.com>',
              to: `${order.user.name} <${order.user.email}>`,
              subject: `New order ${order._id}`,
              html: payOrderEmailTemplate(order),
            },
            (error, body) => {
              if (error) {
                console.log(error);
              } else {
                console.log(body);
              }
            }
          );
  
        res.send({ message: 'Order Paid', order: updatedOrder });
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    })
);

orderRouter.delete(
    '/:id',
    //isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
      const order = await Order.findById(req.params.id);
      if (order) {
        await order.remove();
        res.send({ message: 'Order Deleted' });
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    })
  );
  
  export default orderRouter;