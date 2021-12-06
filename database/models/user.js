const { Schema } = require("../db");
const mongoose = require("../db");
const config = require("../../utils/config");
const { SchemaTypes } = require("mongoose");

const UserSchema = new Schema({
	email: { type: SchemaTypes.String, required: true },
	type: {
		type: SchemaTypes.String,
		enum: [

			config.TYPES.student,
			config.TYPES.organization,
			config.TYPES.company,
		],
		default: config.TYPES.student,
	},
	mobile: { type: SchemaTypes.String, required: true },
	usecase: {
		type: SchemaTypes.String,
		enum: [
			config.USECASE.company,
			config.USECASE.project,
			config.USECASE.organization,
		],
		default: config.USECASE.company,
	},
	auth: {
		userName: { type: SchemaTypes.String, required: true },
		pass: { type: SchemaTypes.String, required: true },
	},
	microservices: [
		{
			name: { type: SchemaTypes.String, required: true },
			clientSecret: { type: SchemaTypes.String, required: true },
		},
	],
});

const UserModel = mongoose.model(config.SCHEMAS.USER, UserSchema);
module.exports = UserModel;
