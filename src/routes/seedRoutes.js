/* const express = require('express')
const Product = ('../models/Products')
const data = require('../data')
const Buyer = require('../models/Buyers')

const seedRoute = express.Router();

seedRoute = express.Router();

seedRoute.get('/', async(req, res) =>{
    await Product.Remove({});
    const createdProducts = await Product.insertMany(data.products);
    await Buyer.remove({});
    const createdBuyers = await Buyer.insertMany(data.buyers);
    res.send({createdProducts, createdBuyers})
});

module.exports = seedRoute; */

const express = require('express');
const Product = ('../models/Products.js');
const data = ('../data.js');
const Buyer = ('../models/Buyers.js');

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  await Product.remove({});
  const createdProducts = await Product.insertMany(data.products);
  await Buyer.remove({});
  const createdBuyers = await User.insertMany(data.buyers);
  res.send({ createdProducts, createdBuyers });
});

module.exports = seedRouter;
