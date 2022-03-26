const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwt_secret, jwt_expiry } = require('../config');

const buyerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },

  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving to database
buyerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });
  
  // Sign JWT and return
  buyerSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, jwt_secret, {
      expiresIn: jwt_expiry,
    });
  };
  
  // Match user entered password to hashed password in database
  buyerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  

const Buyer = mongoose.model('Buyers', buyerSchema);

module.exports = Buyer;
