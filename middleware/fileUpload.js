const multer = require('multer');
const path = require('path');
const config = require('../utils/config');
const utils = require('../utils/utils');

// image upload

const imageStorage = multer.diskStorage({
    destination: path.join(`${__dirname}/../public/images`),
    filename: (req, file, cb) => {
        let filename = `${Date.now()}-NOMI-${file.originalname}`;
        req.image = filename;
        cb(null, filename);
    }
});

const imageUpload = multer({
    storage: imageStorage,
    limits: {
        fileSize: 1000000   // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg)$/)) {     // upload only png and jpg format
            return cb(new Error('Please upload a Image'))
            // return utils.sendResponse(req, null, false, '', {}, 'Please upload a Image');

        }
        cb(undefined, true)
    }
});

const videoStorage = multer.diskStorage({
    destination: path.join(`${__dirname}/../public/videos`),
    filename: (req, file, cb) => {
        let filename = `${Date.now()}-NOMI-${file.originalname}`;
        req.video = filename;
        cb(null, filename);
    }

});

const videoUpload = multer({
    storage: videoStorage,
    limits: {
        fileSize: 10000000 // 10000000 Bytes = 10 MB
    },
    fileFilter(req, file, cb) {
        // upload only mp4 and mkv format
        if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
            return cb(new Error('Please upload a video'))
        }
        cb(undefined, true)
    }
})

module.exports = { imageUpload, videoUpload }