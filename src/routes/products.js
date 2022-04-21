const express = require('express');
const User = require('models/User');
const Vendor = require('models/Vendor');
const Product = require('models/Product');
const data = require('../data');
const asyncHandler = require('middleware/async');
const advancedResults = require('middleware/advancedResults');
const { protect, authorize } = require('middleware/auth');
// const Upload = require("../utils/multer");
// const {cloud} = require("../utils/cloudinary")
const { uploader, cloudinaryConfig } = require('utils/cloudinary')
const { multerUploads, dataUri } = require('utils/multer');

const {
  getProducts,
  getProduct,
  getProductBySlug,
  // getCategories,
  createProduct,
  // searchProducts,
  updateProduct,
  deleteProduct,
  createReview,
} = require('controllers/products');

const router = express.Router();



router
  .route('/')
  .get(advancedResults(Product), getProducts)
  .post(protect, 
    authorize('vendor'), 
    multerUploads, 
    cloudinaryConfig,
    //cloud.uploadToCloud,
    createProduct);

router.route('/slug/:slug').get(getProductBySlug);

// router.route('/categories').get(getCategories);

// router.route('/search').get(searchProducts);

// Populate database with dummy data(products)
router.route('/seed').get(
  asyncHandler(async (req, res) => {
    await Product.deleteMany({});
    const vendor = await User.findOne({ role: 'vendor' });

    if (vendor) {
      const products = data.products.map((product) => ({
        ...product,
        vendor: vendor.id,
      }));
      const createdProducts = await Product.create(products);
      res.send({ createdProducts });
    } else {
      res
        .status(500)
        .send({ message: 'No Vendor found. first run /api/v1/auth/seed' });
    }
  })
);

router
  .route('/:id')
  .get(getProduct)
  .patch(protect, authorize('vendor'), updateProduct)
  .delete(protect, authorize('vendor', 'admin'), deleteProduct);

router.route('/:id/reviews').post(protect, authorize('user'), createReview);

module.exports = router;
