const express = require('express');
const router = express.Router();
const userController = require('../controller/user');
const auth = require('../controller/auth');

router.route('/register').post(userController.register);
router.route('/verify').put(userController.emailAuthentication);
router.route('/login').post(userController.login);
router.route("/search/byUserName/:userName").get(auth.isUserJwt, userController.searchUser);

module.exports = router;