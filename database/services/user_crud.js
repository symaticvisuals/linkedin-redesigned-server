const UserModel = require("../models/user");
const config = require('../../utils/config');

const create = async (createObj) => {
	let userData = await UserModel.create(createObj);
	return userData;
};

const find = async () => {
	let getData = await UserModel.find();
	return getData;
};

const findById = async (id) => {
	let getData = await UserModel.findById(id);
	return getData;
};

const findByUserName = async (userName) => {
	let getData = await UserModel.find({ userName: userName });
	return getData;
};

const updateData = async (data) => {
	const updatedData = await UserModel.findByIdAndUpdate(data.id, data);
	return updatedData;
};


const deleteUser = async (id) => {
	const updatedData = await UserModel.findByIdAndUpdate(id, { isActive: config.dbCode.inActive_by_admin });
	return updateData;
}

module.exports = {
	create,
	find,
	findById,
	findByUserName,
	updateData,
	deleteUser
};
