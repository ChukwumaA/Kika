const express = require('express');
const { getUser } = require('controllers/users');

const router = express.Router({ mergeParams: true });

// middleware to Check user is logged in
const { protect } = require('middleware/auth');

router.use(protect);

router.route('/:id').get(getUser);

module.exports = router;
