const ErrorResponse = require('utils/errorResponse');
const asyncHandler = require('middleware/async');
const { cloudinary } = require('middleware/cloudinary');
const { dataUri } = require('utils/multer');
const Product = require('models/Product');

// @desc      Get all products
// @route     GET /api/v1/products
// @access    Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get product by id
// @route     GET /api/v1/products/:id
// @access    PUBLIC
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate({
    path: 'vendor',
    select: 'name email',
  });

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

// @desc      Get all vendor products by vendor id
// @route     GET /api/v1/products/vendor/:vendorId
// @access    Private(Admin)
exports.getProductsByVendor = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ vendor: req.params.vendorId }).populate(
    {
      path: 'vendor',
      select: 'name email',
    }
  );

  if (!products) {
    return next(
      new ErrorResponse(
        `Products not found for vendor with id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    message: 'Vendor Products retrieved!',
    data: products,
  });
});

// @desc      Get vendor products
// @route     GET /api/v1/products/mine
// @access    Private(vendor)
exports.getVendorProducts = asyncHandler(async (req, res, next) => {
  // if (req.user.id !== req.params.vendorId) {
  //   return next(new ErrorResponse('Can not get products by this vendor', 404));
  // }

  const products = await Product.find({ vendor: req.user.id }).populate({
    path: 'vendor',
    select: 'name email',
  });

  if (!products) {
    return next(
      new ErrorResponse(
        `Products not found for vendor with id of ${req.user.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    message: 'Vendor Products retrieved!',
    data: products,
  });
});

// @desc      Get products via slug
// @route     GET /api/v1/products/slug/:slug
// @access    PUBLIC
exports.getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate({
    path: 'vendor',
    select: 'name email',
  });

  if (!product) {
    return next(
      new ErrorResponse(
        `Product not found with slug of ${req.params.slug}`,
        404
      )
    );
  }
  // if(product){
  //   const vendor = await Vendor.findById(req.params.id);
  // }
  res.status(200).json({
    success: true,
    message: 'Product retrieved!',
    data: product,
  });
});

// @desc      Create a product
// @route     Post /api/v1/products
// @access    Private (Vendor)
exports.createProduct = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse(`No file found`, 404));
  }

  const file = dataUri(req).content;
  const result = await cloudinary.uploader.upload(file, { folder: 'products' });
  try {
    const product = await Product.create({
      ...req.body,
      image: result.secure_url,
      cloudinary_id: result.public_id,
      rating: 0,
      numReviews: 0,
      vendor: req.user.id,
    });

    if (product) {
      res.status(201).json({
        success: true,
        message: 'Product Created',
        data: product,
      });
    }
  } catch (err) {
    return next(new ErrorResponse(err, 404));
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
