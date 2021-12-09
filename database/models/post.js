const mongoose = require('../db');
const { SchemaTypes, Schema } = require('../db');
const config = require('../../utils/config');
const { SchemaType } = require('mongoose');

const postSchema = new Schema({
    message: { type: SchemaTypes.String },
    image: { type: SchemaTypes.string },
    video: { type: SchemaTypes.string },
    likes: [{
        likeBy: { type: SchemaTypes.ObjectId, ref: 'users' },
        time: { type: SchemaTypes.Date }
    }],
    comments: [{
        comment: { type: SchemaTypes.String },
        commentBy: { type: SchemaTypes.ObjectId, ref: 'users' },
        time: { type: SchemaTypes.Date }
    }],
    tags: [{ type: SchemaTypes.String }],
    time: { type: SchemaTypes.Date },
    active: { type: SchemaTypes.Number, default: config.dbCode.post_active_byAdmin },
    postBy: { type: SchemaTypes.ObjectId, ref: 'users' }
});

const postModel = mongoose.model(config.SCHEMAS.POST, postSchema);
module.exports = postModel;