const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Buyer = require('../models/Buyers')
const auth = require('../middleware/auth')
const {isAdmin,} = require ('../middleware/auth')

const buyerRouter = express.Router();


buyerRouter.get(
  '/',
  auth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const users = await Buyer.find({});
    res.send(users);
  })
);

buyerRouter.get(
  '/:id',
  auth,
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
  auth,
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
  auth,
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

// @desc      signin Buyer
// @route     POST /api/v1/buyer/signin
// @access    Public
buyerRouter.post(
  '/signin',
  asyncHandler(async (req, res) => {
    const user = await Buyer.findOne({ email: req.body.email });
    if (!user) {
    }
    new ErrorResponse(`Invalid email or password with id of ${req.params.id}`, 404)
  })
);

// @desc      signup Buyer
// @route     POST /api/v1/buyer/signup
// @access    Public
buyerRouter.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const newBuyer = new Buyer({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newBuyer.save();
    res.send({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  })
);

// @desc      update Buyer
// @route     POST /api/v1/buyer/profile
// @access    Private
buyerRouter.put(
  '/profile',
  auth,
  asyncHandler(async (req, res) => {
    const user = await Buyer.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.username = req.body.username || user.username;
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

export default buyerRouter;


