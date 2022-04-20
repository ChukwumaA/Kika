const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { jwt_secret, jwt_expiry } = require('../config');

const VendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add full name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },

    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    business_name: {
      type: String,
      required: [true, 'Please add a business name'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
    },
    state: {
      type: String,
      required: [true, 'Please add a state'],
    },
    terms: {
      type: Boolean,
      required: [true, 'Please accept terms'],
    },
    id_num: {
      type: Number,
      required: [true, 'Please add ID number'],
    },
    id_image: { type: String, required: [true, 'Please upload ID'] },
    role: {
      type: String,
      required: true,
      enum: ['user', 'vendor','admin'],
      default: 'vendor',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },

  {
    timestamps: true,
  }
);
// Encrypt password using bcrypt before saving to database
VendorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
VendorSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, jwt_secret, {
    expiresIn: jwt_expiry,
  });
};

// Match user entered password to hashed password in database
VendorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
VendorSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('Vendor', VendorSchema);
