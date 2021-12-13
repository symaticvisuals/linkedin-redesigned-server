const utils = require('../utils/utils');
const Post = require('../database/services/post_crud');
const redis = require('../redis/function');
const messageBundle = require('../locales/en');

exports.createPost = async (req, res, next) => {
    try {
        let data = req.body;
        let image = await redis.getValue("post_img_" + req.user._id);
        let video = await redis.getValue("post_video_" + req.user._id);

        if (image) {
            data.image = image;
        }
        if (video) {
            data.video = video;
        }

        data.postBy = req.user._id;

        console.log(data);

        let postData = await Post.createPost(data);

        return utils.sendResponse(req, res, true, messageBundle['insert.success'], postData, '');
    } catch (err) {
        next(err);
    }
}

exports.imageUpload = async (req, res, next) => {
    try {
        let image = req.image;
        await redis.setKey("post_img_" + req.user._id, image, 120);
        return utils.sendResponse(req, res, true, messageBundle['update.success'], image, '');
    } catch (err) {
        next(err);
    }
}
exports.videoUpload = async (req, res, next) => {
    try {
        let video = req.video;
        await redis.setKey("post_video_" + req.user._id, video, 120);
        return utils.sendResponse(req, res, true, messageBundle['update.success'], video, '');
    } catch (err) {
        next(err);
    }
}