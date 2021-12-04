const { Schema } = require("../db");
const mongoose = require("../db");
const { SCHEMAS } = require("../../utils/config");
const { SchemaTypes } = require("mongoose");

const UserSchema = new Schema({
	email: { type: SchemaTypes.String, required: true },
	type: {
		type: SchemaTypes.String,
		enum: [
			SCHEMAS.TYPES.student,
			SCHEMAS.TYPES.organization,
			SCHEMAS.TYPES.company,
		],
		default: SCHEMAS.TYPES.student,
	},
	mobile: { type: SchemaTypes.String, required: true },
	usecase: {
		type: SchemaTypes.String,
		enum: [
			SCHEMAS.USECASE.company,
			SCHEMAS.USECASE.project,
			SCHEMAS.USECASE.organization,
		],
		default: SCHEMAS.USECASE.company,
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

const UserModel = mongoose.model(SCHEMAS.ADMIN, UserSchema);
module.exports = UserModel;
