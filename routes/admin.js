const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin');

router.route('/register').post(adminController.register);

router.route('/login').post(adminController.login);

module.exports = router;