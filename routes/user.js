const express = require('express');
const router = express.Router();
const userController = require('../controller/user');
const auth = require('../controller/auth');
const { imageUpload, videoUpload } = require("../middleware/fileUpload");
const postController = require('../controller/post');


router.route('/register').post(userController.register);
router.route('/verify').put(userController.emailAuthentication);
router.route('/login').post(userController.login);
router.route("/search/byUserName/:userName").get(auth.isUserJwt, userController.searchUser);
router.route('/search/byUserId/:userId').get(auth.isUserJwt, userController.getUserById);
router.route('/follow/:userId').put(auth.isUserJwt, userController.follow);
router.route('/myProfile').get(auth.isUserJwt, userController.getUserProfile);
router.route('/updateProfile').put(auth.isUserJwt, userController.updatMyProfiile);
router.route('/requestPasswordChange/:email').get(userController.requestPasswordChange);
router.route('/changePassword').put(userController.changePassword);
router.route('/profilePicture').put(auth.isUserJwt, imageUpload.single('image'), userController.updateProfilePicture);
// post
router.route('/posts').post(auth.isUserJwt, postController.createPost);
router.route('/posts/imageUpload').post(auth.isUserJwt, imageUpload.single('image'), postController.imageUpload);
router.route('/posts/videoUpload').post(auth.isUserJwt, videoUpload.single('video'), postController.videoUpload);
module.exports = router;