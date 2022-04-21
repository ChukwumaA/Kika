const ErrorResponse = require('utils/errorResponse');
const asyncHandler = require('middleware/async');
const { uploader, cloudinaryConfig } = require('utils/cloudinary')
const cloudinary = require('cloudinary').v2
const { multerUploads, dataUri } = require('utils/multer');
// const upload = require('multer')
// const cloudinary = require('cloudinary')
// const fs = require('fs');
// const upload = require("../utils/multer");
//import { multerUploads } from '../utils/multer';
const Product = require('models/Product');

// @desc      Get all products
// @route     GET /api/v1/products
// @access    Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  // const products = await Product.find();

  // res.status(200).json({
  //   success: true,
  //   data: products,
  // });
  res.status(200).json(res.advancedResults);
});

// @desc      Get product by id
// @route     GET /api/v1/products/:id
// @access    PUBLIC
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    message: 'Product retrieved!',
    data: product,
  });
});

// @desc      Get products via slug
// @route     GET /api/v1/products/slug/:slug
// @access    PUBLIC
exports.getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(
      new ErrorResponse(
        `Product not found with slug of ${req.params.slug}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    message: 'Product retrieved!',
    data: product,
  });
});

// @desc      filter products by search
// @route     GET /api/v1/products/search
// @access    Public
// exports.searchProducts = asyncHandler(async (req, res, next) => {
//   const PAGE_SIZE = 3;
//   const { query } = req;
//   const pageSize = query.pageSize || PAGE_SIZE;
//   const page = query.page || 1;
//   const category = query.category || '';
//   const price = query.price || '';
//   const rating = query.rating || '';
//   const order = query.order || '';
//   const searchQuery = query.query || '';

//   const queryFilter =
//     searchQuery && searchQuery !== 'all'
//       ? {
//           name: {
//             $regex: searchQuery,
//             $options: 'i',
//           },
//         }
//       : {};

//   const categoryFilter = category && category !== 'all' ? { category } : {};
//   const ratingFilter =
//     rating && rating !== 'all'
//       ? {
//           rating: {
//             $gte: Number(rating),
//           },
//         }
//       : {};

//   const priceFilter =
//     price && price !== 'all'
//       ? {
//           // 1-50
//           price: {
//             $gte: Number(price.split('-')[0]),
//             $lte: Number(price.split('-')[1]),
//           },
//         }
//       : {};

//   const sortOrder =
//     order === 'featured'
//       ? { featured: -1 }
//       : order === 'lowest'
//       ? { price: 1 }
//       : order === 'highest'
//       ? { price: -1 }
//       : order === 'toprated'
//       ? { rating: -1 }
//       : order === 'newest'
//       ? { createdAt: -1 }
//       : { _id: -1 };

//   const products = await Product.find({
//     ...queryFilter,
//     ...categoryFilter,
//     ...priceFilter,
//     ...ratingFilter,
//   })
//     .sort(sortOrder)
//     .skip(pageSize * (page - 1))
//     .limit(pageSize);

//   const countProducts = await Product.countDocuments({
//     ...queryFilter,
//     ...categoryFilter,
//     ...priceFilter,
//     ...ratingFilter,
//   });

//   res.send({
//     products,
//     countProducts,
//     page,
//     pages: Math.ceil(countProducts / pageSize),
//   });
// });

// @desc      Create a product
// @route     Post /api/v1/products
// @access    Private (Vendor)
exports.createProduct = asyncHandler(async (req, res, next) => {
  console.log(req.file)
  if(req.file){
    const file = dataUri(req).content;
    return uploader.upload(file).then((result) => {
      // console.log(result)
      // const image = result.url;
      // console.log("IMAGE......",image)

      // return res.status(200).json({
      // messge: 'Your image has been uploded successfully to cloudinary',
      // data: {image}
      // }).catch((err) => res.status(400).json({
      //     messge: 'someting went wrong while processing your request',
      //     data: {err}
      //   }))

      const product = await Product.create({
        ...req.body,
        image:result.url,
        cloudinary_id:result.public,
        rating: 0,
        numReviews: 0,
        vendor: req.user.id,
      });
  
    res.status(201).json({
      success: true,
      message: 'Product Created',
      data: product,
    });
 
        
    })

    // const product = await Product.create({
    //   ...req.body,
    //   image:result.url,
    //   cloudinary_id:result.public,
    //   rating: 0,
    //   numReviews: 0,
    //   vendor: req.user.id,
    // });
  
    // res.status(201).json({
    //   success: true,
    //   message: 'Product Created',
    //   data: product,
    // });
 
  }
  
});

// @desc      Update a product
// @route     PATCH /api/v1/products/:id
// @access    Private (Vendor)
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  //Checking if product owner matches request user and its not admin
  if (req.user.id !== product.vendor.toString() || req.user.role === 'admin') {
    return next(new ErrorResponse(`Not authorized to edit this product`, 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).send({
    success: true,
    message: 'Product updated',
    data: product,
  });
});

// @desc      Delete a product
// @route     DELETE /api/v1/products/:id
// @access    Private (Vendor & Admin)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  if (req.user.id !== product.vendor.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to delete this product`, 404)
    );
  }

  product.remove();

  res.status(200).json({
    success: true,
    message: 'Product deleted!',
    data: {},
  });
});

// @desc      Post reviews
// @route     POST /api/v1/products/:id/reviews
// @access    Private (Users)
exports.createReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  const name = req.user.name;
  const { rating, comment } = req.body;

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // check that review is not from vendor or admin
  if (req.user.id === product.vendor.toString() || req.user.role === 'admin') {
    return next(
      new ErrorResponse(`Not authorized to give review on this product`, 404)
    );
  }

  // checks if user has submitted review previously
  if (product.reviews.find((x) => x.name === name)) {
    return next(new ErrorResponse(`You already submitted a review`, 400));
  }

  const review = {
    name,
    rating: Number(rating),
    comment,
  };

  product.reviews.push(review);

  product.numReviews = product.reviews.length;

  product.rating =
    product.reviews.reduce((a, c) => c.rating + a, 0) / product.reviews.length;

  await product.save();
  // const updatedProduct = await product.save();

  res.status(201).send({
    message: 'Review Created',
    review,
    // review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
    // numReviews: product.numReviews,
    // rating: product.rating,
  });
});
