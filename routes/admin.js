const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin');
const userController = require('../controller/user');
const auth = require('../controller/auth');
const postController = require('../controller/post');

router.route('/register').post(adminController.register);

router.route('/login').post(adminController.login);
router.route('/toggeleUser/:userId').put(auth.isAdminJwt, userController.toggleActiveUser);
router.route('/toggeleUserPost/:postId').put(auth.isAdminJwt, postController.togglePostActive);

module.exports = router;