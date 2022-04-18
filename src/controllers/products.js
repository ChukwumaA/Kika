const ErrorResponse = require('utils/errorResponse');
const asyncHandler = require('middleware/async');
const Product = require('models/Product');
const data = require('../data')

// @desc      Get all products
// @route     GET /api/v1/products
// @access    Public
exports.getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({data});

  res.status(200).json({
    success: true,
    clothes: data.products,
  });
});

// @desc      Get product
// @route     GET /api/v1/products/:id
// @access    PUBLIC
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    message: 'Product retrieved!',
    cloth: data.products,
  });
});

// @desc      Get products via slug
// @route     GET /api/v1/products/slug/:slug
// @access    PUBLIC
exports.getProductBySlug = asyncHandler(async (req, res) => {
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
exports.searchProducts = asyncHandler(async (req, res) => {
  const PAGE_SIZE = 3;
  const { query } = req;
  const pageSize = query.pageSize || PAGE_SIZE;
  const page = query.page || 1;
  const category = query.category || '';
  const price = query.price || '';
  const rating = query.rating || '';
  const order = query.order || '';
  const searchQuery = query.query || '';

  const queryFilter =
    searchQuery && searchQuery !== 'all'
      ? {
          name: {
            $regex: searchQuery,
            $options: 'i',
          },
        }
      : {};

  const categoryFilter = category && category !== 'all' ? { category } : {};
  const ratingFilter =
    rating && rating !== 'all'
      ? {
          rating: {
            $gte: Number(rating),
          },
        }
      : {};

  const priceFilter =
    price && price !== 'all'
      ? {
          // 1-50
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
        }
      : {};

  const sortOrder =
    order === 'featured'
      ? { featured: -1 }
      : order === 'lowest'
      ? { price: 1 }
      : order === 'highest'
      ? { price: -1 }
      : order === 'toprated'
      ? { rating: -1 }
      : order === 'newest'
      ? { createdAt: -1 }
      : { _id: -1 };

  const products = await Product.find({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  })
    .sort(sortOrder)
    .skip(pageSize * (page - 1))
    .limit(pageSize);

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  });

  res.send({
    products,
    countProducts,
    page,
    pages: Math.ceil(countProducts / pageSize),
  });
});

// @desc      filter products by categories
// @route     GET /api/v1/products/categories
// @access    Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.find().distinct('category');

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// @desc      Create a product
// @route     Post /api/v1/products
// @access    Private (Vendor)
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, image, price, category, brand, countInStock, description } =
    req.body;

  const newProduct = new Product({
    name: name + Date.now(),
    slug: name + '-' + Date.now(),
    image: image || '/images/p1.jpg',
    price,
    category,
    brand,
    countInStock,
    description,
    rating: 0,
    numReviews: 0,
    vendor_id: req.user._id,
  });

  const product = await newProduct.save();

  res.send({ message: 'Product Created', product });
});

// @desc      Update a product
// @route     PATCH /api/v1/products/:id
// @access    Private
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  const data = req.body;
  const to_update = Object.keys(data);
  const valid_keys = [
    'name',
    'price',
    'image',
    'images',
    'category',
    'brand',
    'countInStock',
    'description',
  ];
  const is_valid = to_update.every((update) => valid_keys.includes(update));

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }
  if (!is_valid) {
    return next(new ErrorResponse(`Cannot edit product details`, 400));
  }

  //Checking if product creator matches request user
  if (req.user.id !== product.vendor_id) {
    return next(new ErrorResponse(`Not authorized to edit this product`, 404));
  }

  const fieldsToUpdate = {
    ...data,
  };

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedProduct) {
    return next(new ErrorResponse('Internal server error', 401));
  }

  res.status(200).send({ message: 'Product updated', updatedProduct });
});

// @desc      Delete a product
// @route     DELETE /api/v1/products/:id
// @access    Private (Vendor)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  if (req.user.id !== product.vendor_id || req.user.role === 'admin') {
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
// @access    Private (User and Vendors)
exports.createReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    if (product.reviews.find((x) => x.name === req.user.name)) {
      return res
        .status(400)
        .send({ message: 'You already submitted a review' });
    }

    const review = {
      name: req.user.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) /
      product.reviews.length;
    const updatedProduct = await product.save();
    res.status(201).send({
      message: 'Review Created',
      review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      numReviews: product.numReviews,
      rating: product.rating,
    });
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});


