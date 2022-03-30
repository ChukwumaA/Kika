const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const { protect, isVendor, authorize } = require("../middleware/auth");
const productRouter = express.Router();

// @desc      Get all products in database
// @route     GET /api/v1/product/
// @access    Public
productRouter.get("/", async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

// @desc      Get products
// @route     GET /api/v1/product/:id
// @access    PUBLIC
productRouter.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});

// @desc      Get products
// @route     GET /api/v1/product/slug/:slug
// @access    PUBLIC
productRouter.get("/slug/:slug", async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});

const PAGE_SIZE = 3;

// @desc      Get products
// @route     GET /api/v1/product/vendor
// @access    PUBLIC
productRouter.get(
  "/vendor",
  protect,
  isVendor,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

// @desc      filter products by search
// @route     GET /api/v1/product/search
// @access    Public
productRouter.get(
  "/search",
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || "";
    const price = query.price || "";
    const rating = query.rating || "";
    const order = query.order || "";
    const searchQuery = query.query || "";

    const queryFilter =
      searchQuery && searchQuery !== "all"
        ? {
            name: {
              $regex: searchQuery,
              $options: "i",
            },
          }
        : {};
    const categoryFilter = category && category !== "all" ? { category } : {};
    const ratingFilter =
      rating && rating !== "all"
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== "all"
        ? {
            // 1-50
            price: {
              $gte: Number(price.split("-")[0]),
              $lte: Number(price.split("-")[1]),
            },
          }
        : {};
    const sortOrder =
      order === "featured"
        ? { featured: -1 }
        : order === "lowest"
        ? { price: 1 }
        : order === "highest"
        ? { price: -1 }
        : order === "toprated"
        ? { rating: -1 }
        : order === "newest"
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
  })
);

// @desc      filter products by categories
// @route     GET /api/v1/product/categories
// @access    Public
productRouter.get(
  "/categories",
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct("category");
    res.send(categories);
  })
);

//Private routes for vendors

// @desc      Create a product
// @route     Post /api/v1/
// @access    Private
productRouter.post(
  "/",
  protect,
  isVendor,
  expressAsyncHandler(async (req, res) => {
    const { name, image, price, category, brand, countInStock, description } =
      req.body;
    const newProduct = new Product({
      name: name + Date.now(),
      slug: name + "-" + Date.now(),
      image: "/images/p1.jpg",
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
    res.send({ message: "Product Created", product });
  })
);

// @desc      Update a product
// @route     PATCH /api/v1/product/:id
// @access    Private
productRouter.patch(
  "/:id",
  protect,
  isVendor,
  expressAsyncHandler(async (req, res) => {
    const user_id = req.user._id.toString();
    const productId = req.params.id;
    const product = await Product.findById(productId);
    const data = req.body;
    const to_update = Object.keys(data);
    const valid_keys = [
      "name",
      "price",
      "image",
      "images",
      "category",
      "brand",
      "countInStock",
      "description",
    ];
    const is_valid = to_update.every((update) => valid_keys.includes(update));
 
    
    if (!product){
      return res.status(400).send({
        message: "Product not found",
      });}
    if (!is_valid){
      return res.status(400).send({
        message: "cannot edit product details",
      });}

    try {
      //Checking if product creator matches request user
      if (user_id != product.vendor_id) {
        return res
          .status(404)
          .send({ message: "Not authorized to edit this product" });
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
        return next(new ErrorResponse("Internal server error", 401));
      }

       res.status(200).send({ message: "Product updated", updatedProduct });
    
    } catch (error) {
      res.status(400).send({
        message: "Could not edit details",
        error,
      });
    }
  })
);

//PRIVATE ROUTES

// @desc      Delete a product
// @route     DELETE /api/v1/product/:id
// @access    Private
productRouter.delete(
  "/:id",
  protect,
  isVendor,
  expressAsyncHandler(async (req, res) => {
    const user_id = req.user._id.toString();
    const productId = req.params.id;
    const product = await Product.findById(productId);
    //const productVendor = product.vendor_id.toString();

    if (product) {
      if (user_id != product.vendor_id || req.user.role == "admin") {
       return res
          .status(404)
          .send({ message: "Not authorized to delete this product" });
      }
      await product.remove();
      return res.send({ message: "Product Deleted" });
    } else {
     return  res.status(404).send({ message: "Product Not Found" });
    }
  })
);

// @desc      Post reviews
// @route     POST /api/v1/product/:id/reviews
// @access    Private (Buyers and Vendors)
productRouter.post(
  "/:id/reviews",
  protect,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      if (product.reviews.find((x) => x.name === req.user.name)) {
        return res
          .status(400)
          .send({ message: "You already submitted a review" });
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
        message: "Review Created",
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

module.exports = productRouter;
