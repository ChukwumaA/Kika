const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
    },
    location: {
      type: String,
    },
    photo: {
      type: String,
      required: true,
    },

    description: { type: String, required: true },

    price: { type: Number, required: true },
    
    countInStock: { type: Number, required: true },

    likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    comments: [
      {
        text: String,
        postedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
      },
    ],
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', postSchema);
