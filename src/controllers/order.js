const asyncHandler = require('middleware/async');
const Order = require("../models/Order");
const product = require("../models/Product");
const User = require("../models/User");
const {mailgun, payOrderEmailTemplate} = require("../utils/mail");

exports.get_user_orders = asyncHandler(async(req, res, next) => {
    const orders = await Order.find().populate('user', 'name');
    res.send(orders);
    //This is a get Function
    //This will have protect route and maybe admin proviledges if we create it.
});

exports.create_Order = asyncHandler(async(req,res,next) => {
    //This route will be protected an authorized and is a POST function
    const newOrder = new Order ({
        orderItems: req.body.OrderItems, //map((x) => ({...x, product: x._id })),
        deliveryAddress: req.body.deliveryAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        deliveryPrice: req.body.deliveryPrice,
        taxPrice: req.body.taxPrice,
        totalPrice: req.body.totalPrice,
        user: req.body.user//._id,
    });
    const order = await newOrder.save();
    res.status(201). send({message: 'New Order Created', order});

    console.log(err);
    res.status(500).json({
        error: err
      });
});

// I didnt add the code for {user, orders, dailyOrders, productcategory}

exports.user_orders = asyncHandler(async(req, res, next) => {
    const orders = await Order.find({user: req.body.user /*._id*/});
    res.send(orders);

    //This is a get request
    console.log(err);
    res.status(500).json({
        error: err
      });
});

exports.find_orderbyId = asyncHandler(async(req, res, next) => {
    //This right will be protected abd be identified by /:id, in the route
    const order = await Order.findById(req.params.id);
    if(order) {
        res.send(order);
    }
    else {
        res.status(404).send({message: 'Order Not Found'});
    }
    console.log(err);
    res.status(500).json({
        error: err
      });
});

exports.make_delivery = asyncHandler(async(req,res,next) => {
    //This is a put function, so that users can update it.
    //The route will be /deliver
    const order = await Order.find_orderbyId(req.params.id);
    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        await order.save();
        res.send({message: 'Order Delivered'});
    }
     else{
         res.status(404).send({message: 'Order Not Found'});
     }
     console.log(err);
    res.status(500).json({
        error: err
      });
});

exports.make_payment = asyncHandler(async(req,res,next) => {
    //This is a put function to make payment
    //It's route will be /:id/pay
    const order = await Order.findById(req.params.id).populate(
        /*'user',*/ 'email name',
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
                    }
                        else {
                            console.log(body);
                        }
                }
            );
        res.send({mesage: 'Order Paid', order: updateOrder});
    } 
        else {
            res.status(404).send({message: 'Order Not Found'});
        }

    console.log(err);
    res.status(500).json({
        error: err
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

exports.delete_order = asyncHandler(async(req, res, next) => {
    const order = await Order.findById(req.params.id);
    if(order) {
        await order.remove();
        res.send({message: 'Order Deleted'});
    }
        else{
            res.status(404).send({message: 'Order Not Found'});
        }

        console.log(err);
    res.status(500).json({
        error: err
      });
});