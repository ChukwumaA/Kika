const asyncHandler = require('middleware/async');
const Order = require('models/Order');
const ErrorResponse = require('utils/errorResponse');
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId({ length: 10 });
const product = require('models/Product');
const User = require('models/User');
const vendorOrder = require('models/vendorOrders');
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
  //   orderId: `KIKA-${orderId}`,
  //   user,
  //   //deliveryAddress,
  // });
  const newOrder = await Order.create({
    ...req.body,
    orderId:`KIKA-${orderId}`,
    user,
    deliveryAddress:req.body.deliveryAddress,
  });
 
  if(newOrder){
  let orders = newOrder.orderItems
  //   getting each product vendor email
  const vendorsID = newOrder.orderItems.map((item) => item.vendor)
  
  const vendors = vendorsID.filter((id,index)=>{
    return vendorsID.indexOf(id) === index
  });

  vendors.forEach(async (id) => {
    let vendorItems = orders.filter((order)=>{
      return `${order.vendor}`.includes(id)
    })
    let totalPrice = vendorItems
    .reduce((prev,current)=>{
     return prev + (current.price * current.quantity)
    },0)

    const newVendorOrder = await vendorOrder.create({
      orderId: newOrder.orderId,
      products: [...vendorItems],
      vendor: id,
      totalPrice,
      user: newOrder.user,
      deliveryAddress: newOrder.deliveryAddress,
    });
    
    console.log('vendor own order is', newVendorOrder);
  });
}
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

  

  // console.log(vendorsID);



  res.status(201).send({ message: 'New Order Created', newOrder });
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

// @desc      Get vendor products
// @route     GET /api/v1/orders/myorders
// @access    Private(vendor)
exports.getVendorOrders = asyncHandler(async (req, res, next) => {
  const order = await vendorOrder.find({ vendor: req.user._id }).populate({
    path: 'User',
    select: 'name email',
  });
  const user = await User.findById(order[0].user)

  if (!order) {
    return next(
      new ErrorResponse(
        `Products not found for vendor with id of ${req.user.id}`,
        404
      )
    );
  } 
  res.status(200).json({
    success: true,
    message: 'Vendor orders retrieved!',
    data: {order,buyer:user.name}
     
  });
})

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
