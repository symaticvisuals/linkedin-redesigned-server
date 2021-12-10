const express = require('express');
const router = express.Router();
const userController = require('../controller/user');

router.route('/register').post(userController.register);
router.route('/verify').put(userController.emailAuthentication);
router.route('/login').post(userController.login);

module.exports = router;