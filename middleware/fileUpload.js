const multer = require('multer');
const path = require('path');

// image upload

const imageStorage = multer.diskStorage({
    destination: path.join(`${__dirname}/../public/images`),
    filename: (req, file, cb) => {
        let filename = `${Date.now()}-NOMI-${file.originalname}`;
        req.user.profilePicture = filename;
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
        }
        cb(undefined, true)
    }
});

module.exports = { imageUpload }