const { Schema, ScahemaTypes } = require('../db');
const mongoose = require('../db');
const { SCHEMAS } = require('../../utils/config');
const config = require('../../utils/config');
const { SchemaTypes } = require('mongoose');

const adminSchema = new Schema({
    personalInfo: {
        name: { type: SchemaTypes.String, required: true, unique: true },
        mobile: { type: SchemaTypes.String, required: true, unique: true },
        user: {
            type: SchemaTypes.String,
            enum: [

            config.TYPES.student,
            config.TYPES.organization,
            config.TYPES.company,
        ], required: true,
            unique: false
        },
        tags: [String],
        
    },
    auth: {
        userName: { type: SchemaTypes.String, required: true, unique: true },
        pass: { type: SchemaTypes.String, required: true, unique: true }
    }
});

const AdminModel = mongoose.model(SCHEMAS.ADMIN, adminSchema);
module.exports = AdminModel;