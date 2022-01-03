const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin');
const userController = require('../controller/user');
const auth = require('../controller/auth');
const postController = require('../controller/post');
const filterController = require('../controller/filter');
router.route('/register').post(adminController.register);

router.route('/login').post(adminController.login);
router.route('/toggeleUser/:userId').put(auth.isAdminJwt, userController.toggleActiveUser);
router.route('/allUsers').get(auth.isAdminJwt, userController.getAllUsers);
router.route('/allPosts').get(auth.isAdminJwt, postController.getAllPosts);
router.route('/toggeleUserPost/:postId').put(auth.isAdminJwt, postController.togglePostActive);
router.route('/logout').get(auth.isAdminJwt, adminController.logOut);

// filters
router.route('/filter').post(auth.isAdminJwt, filterController.createFilter);
router.route('/filter').get(auth.isAdminJwt, filterController.getAllFilters);
router.route('/filter/:filterId').get(auth.isAdminJwt, filterController.getById);
router.route('/filter/filterName').put(auth.isAdminJwt, filterController.updateFilterName);
router.route('/filter/filterToggle/:filterId').put(auth.isAdminJwt, filterController.toggleActive);

// graphs
router.route('/data/userPostFilters').get(auth.isAdminJwt, postController.count_post_by_filters);
router.route('/data/count_user_posts_likes').get(auth.isAdminJwt, postController.count_user_posts_likes);

module.exports = router;