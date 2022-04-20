const router = require("express").Router();
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');

const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

exports.upload = asyncHandler(async (req, res, next) => {
    upload.single("image")
   try {

    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
     // Create new user
    req.body.image = result.secure_url;
    cloudinary_id =  result.public_id;
    
    if(!req.body.image || !cloudinary_id){
        return next(new ErrorResponse("Upload failed", 401));
    }
    next()
  } catch (err) {
    console.log(err);
  }}); 

exports.uploadID = asyncHandler(async (req, res, next) => {
    upload.single("id_card")
   try {

    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
     // Create new user
    req.body.id_card = result.secure_url;
    cloudinary_id =  result.public_id;
    
    if(!req.body.id_card || !cloudinary_id){
        return next(new ErrorResponse("Upload failed", 401));
    }
    next()
  } catch (err) {
    console.log(err);
  }}); 
