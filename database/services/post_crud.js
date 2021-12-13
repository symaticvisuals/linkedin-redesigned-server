const Post = require('../models/post');
const config = require('../../utils/config');

const createPost = async (data) => {
    let postData = await Post.create(data);
    return postData;
}
const getAll = async () => {
    let getData = await Post.find();
    return getData;
};

const getById = async (id) => {
    const getData = await Post.findById(id);
    return getData;
};

const getByUserId = async (id) => {
    const getData = await Post.find({ postBy: id });
    return getData;
};

const getByTags = async (tags) => {
    const getData = await Post.find({ tags: { "$in": tags } });
    return getData;
}

const updatePost = async (data) => {
    const updateData = await Post.updateMany(data);
    return updateData;
};

const deletePost = async (id) => {
    const delData = await Post.findByIdAndUpdate(id, { active: config.dbCode.post_Inactive_byAdmin });
    return delData;
};

module.exports = {
    createPost,
    getAll,
    getById,
    getByTags,
    getByUserId,
    updatePost,
    deletePost
}