const asyncHandler = require('middleware/async');
const Order = require('models/Order');
const ErrorResponse = require('utils/errorResponse');

const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId({ length: 10 });

const product = require('models/Product');

const User = require('models/User');
const Vendor = require('models/Vendor');
const { mailgun, payOrderEmailTemplate } = require('utils/mail');

exports.getAllOrders = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

exports.createOrder = asyncHandler(async (req, res, next) => {
  const { id: user, deliveryAddress } = req.user;
  const orderId = uid();
  // const newOrder = new Order({
  //   ...req.body,
  //   user,
  //   deliveryAddress,
  // });

  // console.log(newOrder);

  const order = await Order.create({
    ...req.body,
    orderId,
    user,
    deliveryAddress,
  });

  //   mailgun()
  //   .messages()
  //   .send(
  //     {
  //       from: 'KIKA <kika@mg.yourdomain.com>',
  //       to: `${order.user.name} <${order.user.email}>`,
  //       subject: `New order ${order._id}`,
  //       html: payOrderEmailTemplate(order),
  //     },
  //     (error, body) => {
  //       if (error) {
  //         console.log(error);
  //       } else {
  //         console.log(body);
  //       }
  //     }
  //   );

  //   getting each product vendor email
  // const vendorsID = newOrder.orderItems.map((item) => item.vendor);
  // let vendors = [];

  // console.log(vendorsID);

  // vendorsID.forEach(async (id) => {
  //   let vendor = await Vendor.findById(id);
  //   console.log('vendor is', vendor);
  //   // vendors.push(vendor);
  // });

  //   console.log(vendors);

  res.status(201).send({ message: 'New Order Created', order });
});

exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`order not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    message: 'Order retrieved!',
    data: order,
  });
});

exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`order not found with id of ${req.params.id}`, 404)
    );
  }

  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to delete this order`, 404));
  }

  product.remove();

  res.status(200).json({
    success: true,
    message: 'Order deleted!',
    data: {},
  });
});

exports.getOrdersByUser = asyncHandler(async (req, res, next) => {
  // if (req.user.id !== req.params.userId) {
  //   return next(new ErrorResponse('Can not get orders for this user', 404));
  // }

  const orders = await Order.find({ user: req.params.userId });

  if (!orders) {
    return next(
      new ErrorResponse(
        `Orders not found for user with id of ${req.params.userId}`
      ),
      404
    );
  }

  res.status(200).json({
    success: true,
    message: 'User Orders retrieved!',
    data: orders,
  });
});

exports.getUserOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });

  if (!orders) {
    return next(
      new ErrorResponse(`Orders not found for user with id of ${req.user.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    message: 'User Orders retrieved!',
    data: orders,
  });
});
