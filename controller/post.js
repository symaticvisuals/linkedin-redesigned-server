const utils = require('../utils/utils');
const Post = require('../database/services/post_crud');
const redis = require('../redis/function');
const messageBundle = require('../locales/en');
const config = require('../utils/config');

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
        console.log(image);
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

exports.getPosts_home = async (req, res, next) => {
    try {
        const { page = 2, limit = 10 } = req.query;

        let getData = await redis.getValue("posts_page_" + page + req.user._id);
        // console.log(getData);
        if (!getData) {
            getData = await Post.getInPages(page, limit);

            redis.setKey("posts_page_" + page + req.user._id, JSON.stringify(getData), 100);
        } else {
            console.log(getData);
            getData = JSON.parse(getData);
        }
        return utils.sendResponse(req, res, true, messageBundle['search.success'], getData, '');
    } catch (err) {
        next(err);
    }
}

exports.togglePostActive = async (req, res, next) => {
    try {
        let postId = req.params.postId;

        let getPost = await Post.getById(postId);

        if (!getPost) return utils.sendResponse(req, res, false, messageBundle['search.fail'], {}, 'not an objectId');


        if (getPost.active == config.dbCode.post_active_byAdmin) {
            getPost.active = config.dbCode.post_Inactive_byAdmin;
        } else {
            getPost.active = config.dbCode.post_active_byAdmin;

        }

        let updatedData = await Post.updatePost({ id: postId, updateData: { active: getPost.active } });
        return utils.sendResponse(req, res, true, messageBundle['update.success'], updatedData, '');

    } catch (err) {
        if (err.name === 'CastError')
            return utils.sendResponse(req, res, false, messageBundle['search.fail'], {}, 'not an objectId');
        next(err);

    }
}