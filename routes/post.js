const express = require('express');
const router = express.Router();
const postController = require('../controller/post');
const auth = require('../controller/auth');
const fileUpload = require('../middleware/fileUpload');

module.exports = router;