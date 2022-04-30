const Cart = require('models/cart');
const Product = require('models/Product');
const Order = require('models/Order');
const { chargeCard } = require('controllers/payments');
const asyncHandler = require('middleware/async');

exports.add_to_cart = asyncHandler(async(req,res, next) => {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
       if (err) {
           return res.redirect('/');
       }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/cart');
    });
});

exports.reduce_cart = asyncHandler(async(req,res, next) => {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/cart');
});

exports.remove_cartItem = asyncHandler(async(req,res,next) => {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/cart');
});

exports.shoppingcart = asyncHandler(async(req, res,next) => {
       if (!req.session.cart) {
       return res.render('/cart', {products: null});
     } 
    var cart = new Cart(req.session.cart);
    res.render('/cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

exports.checkout = asyncHandler(async(req, res, next) => {
    if (!req.session.cart) {
        return res.redirect('/cart');
    }
    var cart = new Cart(req.session.cart);

    checkoutToPayment = function(err, charge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/checkout'); 
        }
        else(
            res.redirect('/fromCard/flutterwave', chargeCard)
        )
        var order = new Order({
            user:req.body.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentMethod: charge.id
        });
        order.save(function(err, result) {
            req.flash('success', 'Successfully bought product!');
            req.session.cart = null;
            res.redirect('/');
        });
    }
});