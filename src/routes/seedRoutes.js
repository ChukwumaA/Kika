const express = require('express')
const Product = ('../models/Products')
const data = require('..data.js')
const Buyer = require('../models/Buyers')

const seedRouter = express.Router();

seedRouter = express.Router();

seedRouter.get('/', async(req, res) =>{
    await Product.Remove({});
    const createdProducts = await Product.insertMany(data.products);
    await Buyer.remove({});
    const createdBuyers = await Buyer.insertMany(data.buyers);
    res.send({createdProducts, createdBuyers})
});

module.exports = seedRouter;