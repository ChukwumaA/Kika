const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const { jwt_secret } = require("config");
const Vendor = require("../models/Vendor");
const Buyer = require("../models/Buyer");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, jwt_secret);

    //Find user in 'user DB'
    req.user = await Vendor.findById(decoded.id);

    //If there's no user in 'user DB' check in 'buyer DB'
    if (!req.user) {
      req.user = await Buyer.findById(decoded.id);
    }

    next();
  } catch (err) {
    return next(
      new ErrorResponse("::Not authorized to access this route", 401)
    );
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role \'${req.user.role}'\ is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Vendor Token" });
  }
};
