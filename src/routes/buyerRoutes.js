const express = require('express');
const buyerRouter  = require('../controllers/buyers');

const router = express.Router({mergeParams: true});

//middleware to check if the user is logged in
const { protect } = require('middleware/auth');

router.use(protect);

router.route(
    '/',
    '/:id',
    'signin',
    '/signup',
    '/profile'
    ).get(buyerRouter)

module.exports = router;