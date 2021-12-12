const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin');
const userController = require('../controller/user');
const auth = require('../controller/auth');

router.route('/register').post(adminController.register);

router.route('/login').post(adminController.login);
router.route('/toggeleUser/:userId').put(auth.isAdminJwt, userController.toggleActiveUser);

module.exports = router;