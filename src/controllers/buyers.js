const ErrorResponse = require('../utils/errorResponse')
const express = require('express')
const asyncHandler = require('../middleware/async')
const Buyer = require('../models/Buyers')
//const auth = require('../middleware/auth')
const {protect, authorize, isAdmin,} = require ('../middleware/auth')

const buyerRouter = express.Router();

buyerRouter.get(
  '/',
  protect,
  authorize,
  isAdmin,
  asyncHandler(async (req, res) => {
    const users = await Buyer.find({});
    res.send(users);
  })
);

buyerRouter.get(
  '/:id',
  protect,
  authorize,
  isAdmin,
  asyncHandler(async (req, res) => {
    const user = await Buyer.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
        new ErrorResponse(`Buyer not found with id of ${req.params.id}`, 404)
    }
  })
);

buyerRouter.put(
  '/:id',
  protect,
  authorize,
  isAdmin,
  asyncHandler(async (req, res) => {
    const user = await Buyer.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);
      const updatedBuyer = await user.save();
      res.send({ message: 'Buyer Updated', user: updatedBuyer });
    } else {
        new ErrorResponse(`Buyer not found with id of ${req.params.id}`, 404)
    }
  })
);

buyerRouter.delete(
  '/:id',
  protect,
  authorize,
  isAdmin,
  asyncHandler(async (req, res) => {
    const user = await Buyer.findById(req.params.id);
    if (user) {
      if (user.email === 'admin@example.com') {
        new ErrorResponse(`Can Not Delete Admin Buyer with id of ${req.params.id}`, 404)
        return;
      }
      await user.remove();
      res.send({ message: 'Buyer Deleted' });
    } else {
        new ErrorResponse(`Buyer not found with id of ${req.params.id}`, 404)
    }
  })
);
buyerRouter.post(
  '/signin',
  asyncHandler(async (req, res) => {
    const user = await Buyer.findOne({ email: req.body.email });
    if (!user) {
    }
    new ErrorResponse(`Invalid email or password with id of ${req.params.id}`, 404)
  })
);

buyerRouter.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const newBuyer = new Buyer({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newBuyer.save();
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  })
);

buyerRouter.put(
  '/profile',
  protect,
  authorize,
  asyncHandler(async (req, res) => {
    const user = await Buyer.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {}

      const updatedBuyer = await user.save();
      res.send({
        _id: updatedBuyer._id,
        name: updatedBuyer.name,
        email: updatedBuyer.email,
        isAdmin: updatedBuyer.isAdmin,
        token: generateToken(updatedBuyer),
      });
    } else {
        new ErrorResponse(`Buyer not found with id of ${req.params.id}`, 404)
    }
  })
);

module.exports = buyerRouter;


