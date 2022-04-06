const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwt_secret, jwt_expiry } = require('../config');

const VendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add full name'],
    },
    
    username: {
      type: String,
      required: [true, 'Please add a preferred username'],
      unique: true,
      match: [
        /^(?!\d+)(?=.{4,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/gm,
        `Username cannot start with a number or special character`,
      ],
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
      minlength: 8,
      select: false,
    },

    profilePic: {
      type: String,
      default: 'no-photo.jpg',
    },

    role: {
      type: String,
      required: true,
      default:"vendor"
    },
    
    isAdmin: { 
      type: Boolean, 
      default: false, 
      required: true 
    },
    
    isVendor: {
      type: Boolean, 
      default: true, 
      required: true 
    },

    followers: [{ type: mongoose.Schema.ObjectId, ref: ['Vendor', 'Buyer'] }], //I dont this we need following feature
    following: [{ type: mongoose.Schema.ObjectId, ref: ['Vendor' ,'Buyer'] }], // This too
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

module.exports = mongoose.model('Vendor', VendorSchema);
