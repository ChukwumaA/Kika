const express = require('express');
// const Product = require('models/Product');
// const data = require('../data');
// const asyncHandler = require('middleware/async');

const {
  getProducts,
  getProduct,
  getProductBySlug,
  getCategories,
  createProduct,
  searchProducts,
  updateProduct,
  deleteProduct,
  createReview,
} = require('controllers/products');

const router = express.Router();

const { protect, authorize } = require('middleware/auth');

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('vendor'), createProduct);

router
  .route('/:id')
  .get(getProduct)
  .patch(protect, authorize('vendor'), updateProduct)
  .delete(protect, authorize('vendor'), deleteProduct);

router.get('/slug/:slug', getProductBySlug);

router.get('/categories', getCategories);

router.get('/search', searchProducts);

router.post('/:id/reviews', protect, authorize('user', 'vendor'), createReview);

// Populate database with dummy data(products)
// router.get(
//   '/seed',
//   asyncHandler(async (req, res) => {
//     await Product.remove({});
//     const createdProducts = await Product.insertMany(data.products);
//     res.send({ createdProducts });
//   })
// );

// @desc      Get products
// @route     GET /api/v1/product/vendor
// @access    PUBLIC
// router.get(
//   '/vendor',
//   protect,
//   expressAsyncHandler(async (req, res) => {
//     const { query } = req;
//     const page = query.page || 1;
//     const pageSize = query.pageSize || PAGE_SIZE;

//     const products = await Product.find()
//       .skip(pageSize * (page - 1))
//       .limit(pageSize);
//     const countProducts = await Product.countDocuments();
//     res.send({
//       products,
//       countProducts,
//       page,
//       pages: Math.ceil(countProducts / pageSize),
//     });
//   })
// );

module.exports = router;
