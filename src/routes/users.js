const express = require('express');
const { getUsers, 
        getUser, 
        deleteUser ,
        get
    } = require('controllers/users');

const router = express.Router();

const { protect, authorize } = require('middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);

router.route('/:id').get(getUser).delete(deleteUser);

module.exports = router;
