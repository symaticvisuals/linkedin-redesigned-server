const mongoose = require('../db');
const { SchemaTypes, Schema } = require('../db');
const config = require('../../utils/config');
const { SchemaType } = require('mongoose');

const postSchema = new mongoose.Schema({
    message: { type: SchemaTypes.String },
    image: { type: SchemaTypes.String },
    video: { type: SchemaTypes.String },
    number_of_likes: { type: SchemaTypes.Number, default: 0 },
    likes: [{
        likeBy: { type: SchemaTypes.ObjectId, ref: 'users' },
        time: { type: SchemaTypes.Date }
    }],
    number_of_comments: { type: SchemaTypes.Number, default: 0 },
    comments: [{
        comment: { type: SchemaTypes.String },
        commentBy: { type: SchemaTypes.ObjectId, ref: 'users' },
        time: { type: SchemaTypes.Date }
    }],
    tags: [{ type: SchemaTypes.String }],
    time: { type: SchemaTypes.Date, default: Date.now() },
    active: { type: SchemaTypes.Number, default: config.dbCode.post_active_byAdmin },
    postBy: { type: SchemaTypes.ObjectId, ref: 'users' }
});

const postModel = mongoose.model(config.SCHEMAS.POST, postSchema);
module.exports = postModel;