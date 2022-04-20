const mongoose = require('mongoose');
const slugify = require('slugify');

const ReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const ProductSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true, unique: true },
    slug: { type: String },
    category: { type: String, enum: ['Male', 'Female'] },
    newArrival: { type: Boolean, default: false },
    // images: [String],
    color: { type: String },
    grade: { type: String, enum: ['A', 'B'], required: true },
    size: { type: String, enum: ['S', 'M', 'L', 'XL'], required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    brand: { type: String },
    rating: { type: Number, required: true },
    numReviews: { type: Number, required: true },
    description: { type: String, required: true },
    vendor: {
      type: mongoose.Schema.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    reviews: [ReviewSchema],
  },
  {
    timestamps: true,
  }
);

// Create Product slug from the name
ProductSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
