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
        likeBy: { type: SchemaTypes.ObjectId, ref: 'users', unique: true },
        time: { type: SchemaTypes.Date, default: Date.now() }
    }],
    number_of_comments: { type: SchemaTypes.Number, default: 0 },
    comments: [{
        comment: { type: SchemaTypes.String },
        commentBy: { type: SchemaTypes.ObjectId, ref: 'users' },
        time: { type: SchemaTypes.Date, default: Date.now() }
    }],
    tags: [{ type: SchemaTypes.String }],
    time: { type: SchemaTypes.Date, default: Date.now() },
    active: { type: SchemaTypes.Number, default: config.dbCode.post_active_byAdmin },
    postBy: { type: SchemaTypes.ObjectId, ref: config.SCHEMAS.USER  }
});

const postModel = mongoose.model(config.SCHEMAS.POST, postSchema);
module.exports = postModel;