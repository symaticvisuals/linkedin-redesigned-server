const utils = require('../utils/utils');
const Post = require('../database/services/post_crud');
const redis = require('../redis/function');
const messageBundle = require('../locales/en');
const config = require('../utils/config');

exports.createPost = async (req, res, next) => {
    try {
        let data = req.body;
        let image = await redis.getValue(config.REDIS_PREFIX.POST_IMAGE + req.user._id);
        let video = await redis.getValue(config.REDIS_PREFIX.POST_VIDEO + req.user._id);

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
        await redis.setKey(config.REDIS_PREFIX.POST_IMAGE + req.user._id, image, 120);
        return utils.sendResponse(req, res, true, messageBundle['update.success'], image, '');
    } catch (err) {
        next(err);
    }
}
exports.videoUpload = async (req, res, next) => {
    try {
        let video = req.video;
        await redis.setKey(config.REDIS_PREFIX.POST_VIDEO + req.user._id, video, 120);
        return utils.sendResponse(req, res, true, messageBundle['update.success'], video, '');
    } catch (err) {
        next(err);
    }
}

exports.getPosts_home = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // get posts of specific page from redis if already saved
        let getData = await redis.getValue(config.REDIS_PREFIX.POSTS_BY_PAGES + page + req.user._id);

        // check if user has updated filters
        let filters = await redis.getValue(config.REDIS_PREFIX.SEARCH_FILTERS + req.user._id);

        if (filters) {
            filters = JSON.parse(filters);
            console.log(filters);
        } else {

            // if not updated filters ... then use the old one from jwt
            filters = req.user.intrestFilters;
        }


        if (!getData) {

            // if redis doesnt have the posts saved. fetch from db
            getData = await Post.getInPages(page, limit, filters);

            // set the newly fetched post to redis
            redis.setKey(config.REDIS_PREFIX.POSTS_BY_PAGES + page + req.user._id, JSON.stringify(getData), 100);
        } else {

            //  this is when you get posts from redis
            getData = JSON.parse(getData);
        }
        return utils.sendResponse(req, res, true, messageBundle['search.success'], getData, '');
    } catch (err) {
        next(err);
    }
}

// search will filter on the basis of message and filters selected by user 
// also message searches use >>(text) Index 

exports.searchPost = async (req, res, next) => {
    try {
        let search = req.params.search;

        // if user has upddated his filters
        let tags = await redis.getValue(config.REDIS_PREFIX.SEARCH_FILTERS + req.user._id);

        if (!tags) {
            // if not updated tags use the old ones from jwt
            tags = req.user.intrestFilters;
        } else {
            // parse the redis filters to json
            tags = JSON.parse(tags);
        }

        let getData = await Post.getByTagsAndMessage({ tags: tags, message: search });

        utils.sendResponse(req, res, true, messageBundle['search.success'], getData, '');

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