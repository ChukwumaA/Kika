const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
)

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    images: [String],
    size: { type: String, required: true },
    brand: { type: String},
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, required: true },
    numReviews: { type: Number, required: true },
    vendor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    reviews: [ReviewSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', ProductSchema);