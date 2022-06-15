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
  //   user,
  //   deliveryAddress,
  // });

  //console.log("USER   ",req.user);
  // console.log(newOrder);
/* Working code */
  // const order = await Order.create({
  //   ...req.body,
  //   orderId:`KIKA-${orderId}`,
  //   user,
  //   deliveryAddress,
  // });
  /* Working code */

   /* My code */
  const order = new Order({
    ...req.body,
    orderId:`KIKA-${orderId}`,
    user,
    deliveryAddress,
  });
  /* My code */
  //console.log("ORDER:   ", order )

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

  //getting each product vendor ID
  const vendorsID = order.orderItems.map((item) => item.vendor);
  const vendors = vendorsID.filter((id,index)=> vendorsID.indexOf(id)===index);

  //console.log("IDS",vendorsID); 
  console.log("Vendors",vendors); 
  
  const orderItems = order.orderItems;

  // const check = orderItems.filter(item=>item['vendor'] == '626068e2ac0f9c26303816b1')
  for(let vendor of vendors){
    let vendorItems = orderItems.filter(item=>{
      console.log("Match:", item['vendor'] === vendor)
      console.log("Type Of vendor from order", typeof(`${vendor}`))
      console.log("Type Of id in orderitems", typeof(item['vendor']))

      if(`${item['vendor']}` == `${vendor}`)return true
      else return false
    });
    console.log("VendorItem:   ", vendorItems)
  }
  // vendors.forEach(async (id) => {
  //   // let vendor = await Vendor.findById(id);
  //   // console.log('vendor is', vendor);
  //   let vendorItems = orderItems.filter(item=>{
  //     console.log("Vendor:", item['vendor'])
  //     console.log("ID:", id)
  //     if(item['vendor'] == id){
  //       console.log("Vendor:   ", item['vendor'])
  //       return true
  //     }
  //     else {return false}
  //   });
  // //  console.log("Vendor Items:   ", vendorItems )
  //   // vendors.push(vendor);
  //   // const vendororder = new vendorOrder({
  //   //   vendorItems,
  //   //   orderId:`KIKA-${orderId}`,
  //   //   user,
  //   //   deliveryAddress,
  //   // });
  //   /* My code */
  //   //console.log("ORDER:   ", vendororder )
  // });
  // const vendorOrderss = vendors.map(vendor=> orderItems.vendor == vendor)

  //    console.log(vendorOrderss);

  //res.status(201).send({ message: 'New Order Created', order });
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

// @desc      Get vendor orders
// @route     GET /api/v1/orders/myorders
// @access    Private(vendor)
exports.getVendorOrders = asyncHandler(async (req, res, next) => {
  const order = await vendorOrder.find({ vendor: req.user._id }).populate({
    path: 'User',
    select: 'name email',
  });
  const user = await User.findById(order[0].user)
  const newOrder = {
    ...order[0]._doc,
    buyer:user.name
  }

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
    data: [newOrder]
     
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
