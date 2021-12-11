const { Schema } = require("../db");
const mongoose = require("../db");
const config = require("../../utils/config");
const { SchemaTypes, SchemaType } = require("mongoose");

const UserSchema = new Schema({
	email: { type: SchemaTypes.String, required: true, unique: true },
	firstName: { type: SchemaTypes.String, required: true },
	lastName: { type: SchemaTypes.String, required: true },
	designation: { type: SchemaTypes.String, required: true },
	password: { type: SchemaTypes.String, required: true },
	userName: { type: SchemaTypes.String, required: true, unique: true, trim: true },
	education: { type: SchemaTypes.String },
	profilePic: { type: SchemaTypes.String },
	// posts: [{ type: SchemaTypes.ObjectId, ref: 'Posts' }],
	emailAuth: { type: SchemaTypes.Number, default: config.dbCode.email_not_Authenticated },
	isActive: { type: Number, default: config.dbCode.active_by_admin },
	number_of_followers: { type: SchemaTypes.Number, default: 0 },
	followers: [
		{
			userName: { type: SchemaTypes.String },
			userId: { type: SchemaTypes.ObjectId, ref: "users" }
		}
	],
	number_of_following: { type: SchemaTypes.Number, default: 0 },
	following: [
		{
			userName: { type: SchemaTypes.String },
			userId: { type: SchemaTypes.ObjectId, ref: "users" }
		}
	],
});

const UserModel = mongoose.model(config.SCHEMAS.USER, UserSchema);
module.exports = UserModel;
