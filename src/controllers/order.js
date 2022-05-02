const asyncHandler = require('middleware/async');
const Order = require('models/Order');
const product = require('models/Product');
const User = require('models/User');
const Vendor = require('models/Vendor');
const { mailgun, payOrderEmailTemplate } = require('utils/mail');

exports.getUserOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find().populate('user', 'name');
  //   res.send(orders);
  //   res.status(200).json(res.advancedResults);
  res.status(200).json({
    success: true,
    message: 'Orders retrieved!',
    data: orders,
  });
});

exports.createOrder = asyncHandler(async (req, res, next) => {
  const { id: user, deliveryAddress } = req.user;

  const newOrder = new Order({
    ...req.body,
    user,
    deliveryAddress,
  });

  console.log(newOrder);

  const order = await newOrder.save();

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

// I didnt add the code for {user, orders, dailyOrders, productcategory}

exports.userOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.body.user /*._id*/ });
  res.send(orders);

  //This is a get request
  console.log(err);
  res.status(500).json({
    error: err,
  });
});

exports.findOrderById = asyncHandler(async (req, res, next) => {
  //This right will be protected abd be identified by /:id, in the route
  const order = await Order.findById(req.params.id);
  if (order) {
    res.send(order);
  } else {
    res.status(404).send({ message: 'Order Not Found' });
  }
  console.log(err);
  res.status(500).json({
    error: err,
  });
});

exports.makeDelivery = asyncHandler(async (req, res, next) => {
  //This is a put function, so that users can update it.
  //The route will be /deliver
  const order = await Order.find_orderbyId(req.params.id);
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    await order.save();
    res.send({ message: 'Order Delivered' });
  } else {
    res.status(404).send({ message: 'Order Not Found' });
  }
  console.log(err);
  res.status(500).json({
    error: err,
  });
});

exports.makePayment = asyncHandler(async (req, res, next) => {
  //This is a put function to make payment
  //It's route will be /:id/pay
  const order = await Order.findById(req.params.id).populate(
    /*'user',*/ 'email name'
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

    const updateOrder = await order.save();
    mailgun()
      .messages()
      .send(
        {
          from: 'KIKA <kika@mg.yourdomain.com>',
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
    res.send({ mesage: 'Order Paid', order: updateOrder });
  } else {
    res.status(404).send({ message: 'Order Not Found' });
  }

  console.log(err);
  res.status(500).json({
    error: err,
  });
});

//This is the checkout part from th efigma file that leads to payment
// exports.checkout = asyncHandler(async(req, res, next) => {
//     if (!req.session.cart) {
//         return res.redirect('/cart');
//     }
//     var cart = new Cart(req.session.cart);

//     checkoutToPayment = function(err, charge) {
//         if (err) {
//             req.flash('error', err.message);
//             return res.redirect('/checkout');
//         }
//         else(
//             res.redirect('/fromCard/flutterwave', chargeCard)
//         )
//         var order = new Order({
//             user:req.body.user,
//             cart: cart,
//             address: req.body.address,
//             name: req.body.name,
//             paymentMethod: charge.id
//         });
//         order.save(function(err, result) {
//             req.flash('success', 'Successfully bought product!');
//             req.session.cart = null;
//             res.redirect('/');
//         });
//     }
// });

exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    await order.remove();
    res.send({ message: 'Order Deleted' });
  } else {
    res.status(404).send({ message: 'Order Not Found' });
  }

  console.log(err);
  res.status(500).json({
    error: err,
  });
});
