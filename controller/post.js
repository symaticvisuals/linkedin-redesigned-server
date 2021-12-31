const utils = require('../utils/utils');
const Post = require('../database/services/post_crud');
const redis = require('../redis/function');
const messageBundle = require('../locales/en');
const config = require('../utils/config');
const { log, nextTick } = require('async');
const _ = require('lodash');

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

        await redis.deleteKey(config.REDIS_PREFIX.MY_POSTS + req.user._id);

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
            redis.setKey(config.REDIS_PREFIX.POSTS_BY_PAGES + page + req.user._id, JSON.stringify(getData), 10);
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
exports.getMyPosts = async (req, res, next) => {
    try {
        let { page = 1, limit = 5 } = req.query;

        // check if user posts are on redis
        let myPosts = await redis.getValue(config.REDIS_PREFIX.MY_POSTS + req.user._id);

        if (myPosts) {
            myPosts = JSON.parse(myPosts);
        } else {
            // if not found on redis then fetch it from database
            myPosts = await Post.getByUserId({ id: req.user._id, page: page, limit: limit });
            //    set the newly fetched data on redis
            redis.setKey(config.REDIS_PREFIX.MY_POSTS + req.user._id, JSON.stringify(myPosts), config.LOGIN_EXPIRE_TIME);
        }
        return utils.sendResponse(req, res, true, messageBundle['search.success'], myPosts, '');
    } catch (err) {
        next(err);
    }
}

exports.userDeletePost = async (req, res, next) => {
    try {
        let userPostId = req.params.postId;

        let delPost = await Post.deleteByUserIdAndPostId({ postId: userPostId, userId: req.user._id });

        if (!delPost) return utils.sendResponse(req, res, false, messageBundle['search.fail'], {}, 'no such post found');


        // delete the userPosts from redis as its updated
        redis.deleteKey(config.REDIS_PREFIX.MY_POSTS + req.user._id);

        // also delete the posts of the other user whose post were liked
        redis.deleteKey(config.REDIS_PREFIX.MY_POSTS + delPost.postBy);

        return utils.sendResponse(req, res, true, messageBundle['update.success'], delPost, '');

    } catch (err) {
        if (err.name === 'CastError')
            return utils.sendResponse(req, res, false, messageBundle['search.fail'], {}, 'not an objectId');
        next(err);
    }
};

exports.likePost_toggle = async (req, res, next) => {
    try {
        // check if already liked
        let ifLiked = await Post.getIfLiked({ postId: req.params.postId, userId: req.user._id });
        let updatePost;

        // true if liked false if dislike
        let like;

        if (ifLiked) {
            // if yes then dislike
            like = false;
            updatePost = await Post.updatePostLike_dec({ postId: req.params.postId, userId: req.user._id });
        } else {
            // else like 
            like = true;
            updatePost = await Post.updatePostLike_inc({ postId: req.params.postId, userId: req.user._id });
        }
        return utils.sendResponse(req, res, true, messageBundle['update.success'], { like, userId: req.user._id, postId: req.params.postId }, '');

    } catch (err) {
        console.log(err);
        if (err.name === 'CastError')
            return utils.sendResponse(req, res, false, messageBundle['search.fail'], {}, 'not an objectId');
        next(err);
    }
}

exports.createComment = async (req, res, next) => {
    try {
        let data = req.body;


        let updateData = await Post.updateComment_inc({ postId: data.postId, userId: req.user._id, comment: data.comment });
        if (!updateData) return utils.sendResponse(req, res, false, messageBundle['update.fail'], {}, 'no such post found');

        // if user comments on his post then its post need to be deleted from redis
        if (updateData.postBy == req.user._id) {
            await redis.deleteKey(config.REDIS_PREFIX.MY_POSTS + req.user._id);
        }

        let response = {
            comment: updateData.comments[updateData.number_of_comments - 1],
            nummberOfComments: updateData.number_of_comments
        };

        return utils.sendResponse(req, res, true, messageBundle['update.success'], response, '');
    } catch (err) {
        next(err);
    }
}

exports.deleteComment = async (req, res, next) => {
    try {
        let data = req.body;
        let updatePost = await Post.updateByPostIdAndCommentId({ postId: data.postId, userId: req.user._id, commentId: data.commentId });

        if (!updatePost) return utils.sendResponse(req, res, false, messageBundle['update.fail'], {}, 'no such post found');

        // if user comments on his post then its post need to be deleted from redis
        // if (updatePost.postBy == req.user._id) {
        //     await redis.deleteKey(config.REDIS_PREFIX.MY_POSTS + req.user._id);
        // }

        return utils.sendResponse(req, res, true, messageBundle['update.success'], updatePost, '');

    } catch (err) {
        if (err.name === 'CastError')
            return utils.sendResponse(req, res, false, messageBundle['search.fail'], {}, 'not an objectId');
        next(err);
    }
}

exports.count_post_by_filters = async (req, res, next) => {
    try {
        const getData = await Post.getCountUser_postFilters();
        return utils.sendResponse(req, res, true, messageBundle['search.success'], getData, '');
    } catch (err) {
        next(err);
    }
}

exports.count_user_posts_likes = async (req, res, next) => {
    try {
        const getData = await Post.getMostLikedPosts();
        return utils.sendResponse(req, res, true, messageBundle['search.success'], getData, '');
    } catch (err) {
        next(err);
    }
}