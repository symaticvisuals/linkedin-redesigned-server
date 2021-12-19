const Post = require('../models/post');
const { Types, SchemaTypes } = require('mongoose');
const config = require('../../utils/config');
const { size } = require('lodash');

const createPost = async (data) => {
    let postData = await Post.create(data);
    return postData;
}
const getAll = async () => {
    let getData = await Post.find();
    return getData;
};

const getInPages = async (page, limit, filters) => {
    limit = parseInt(limit);
    let skip = (page - 1) * limit;

    let getData = await Post.find({ active: config.dbCode.post_active_byAdmin, tags: { $in: filters } }, {}, { limit: limit, skip: skip });
    // .limit(limit * 1).skip((page - 1) * limit);
    return getData;
}

const getById = async (id) => {
    const getData = await Post.findById(id);
    return getData;
};

const getByUserId = async (data) => {
    const getData = await Post.find({ active: config.dbCode.post_active_byAdmin, postBy: data.id }).skip(data.limit * (data.page - 1)).limit(data.limit * 1);
    return getData;
};



const getByTags = async (tags) => {
    const getData = await Post.find({ tags: { "$in": tags } });
    return getData;
}

// text index on message attribute as it will help in search results
const getByTagsAndMessage = async (data) => {
    const getData = await Post.find({ tags: { "$in": data.tags }, $text: { $search: data.message } });
    return getData;
}

const getIfLiked = async (data) => {
    const getData = await Post.findOne({
        _id: data.postId, likes: {
            "$elemMatch": {
                "likeBy": data.userId
            }
        }
    });

    return getData;
}

updateByPostIdAndCommentId = async (data) => {
    const getData = await Post.findOneAndUpdate({
        _id: data.postId, active: config.dbCode.post_active_byAdmin,
        comments: {
            $elemMatch: {
                _id: data.commentId
            }
        }
    }, {
        $inc: { number_of_comments: -1 },
        $pull: {
            comments: {
                _id: data.commentId
            }
        }
    }, {
        new: true
    });
    return getData;
}

const updatePost = async (data) => {
    const updateData = await Post.findByIdAndUpdate(data.id, data.updateData, { new: true });
    return updateData;
};

const updatePostLike_inc = async (data) => {

    const updateData = await Post.findOneAndUpdate({
        _id: data.postId,
        active: config.dbCode.post_active_byAdmin,

    },
        { $inc: { number_of_likes: 1 }, $push: { likes: { likeBy: data.userId } } }, { new: true });
    return updateData;
}
const updatePostLike_dec = async (data) => {

    const updateData = await Post.findOneAndUpdate({
        _id: data.postId,
        active: config.dbCode.post_active_byAdmin,

    },
        { $inc: { number_of_likes: -1 }, $pull: { likes: { likeBy: data.userId } } }, { new: true });
    return updateData;
}

const updateComment_inc = async (data) => {
    const updateData = await Post.findOneAndUpdate({ _id: data.postId, active: config.dbCode.post_active_byAdmin }, {
        $inc: { number_of_comments: 1 }, $push: {
            comments: {
                comment: data.comment,
                commentBy: data.userId
            }
        }
    }, { new: true });
    return updateData;
}

const deletePost = async (id) => {
    const delData = await Post.findByIdAndUpdate(id, { active: config.dbCode.post_Inactive_byAdmin });
    return delData;
};

const deleteByUserIdAndPostId = async (data) => {
    const delData = await Post.findOneAndUpdate({ active: config.dbCode.post_active_byAdmin, postBy: data.userId, _id: data.postId }, { active: config.dbCode.post_Inactive_byAdmin }, { new: true });
    return delData;
};
module.exports = {
    createPost,
    getAll,
    getInPages,
    getIfLiked,
    getById,
    getByTags,
    getByUserId,
    getByTagsAndMessage,
    updatePost,
    updatePostLike_inc,
    updateComment_inc,
    updateByPostIdAndCommentId,
    deletePost,
    deleteByUserIdAndPostId,
    updatePostLike_dec
}