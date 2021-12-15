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

const findIfFollowing = async (currentUserId, otherUserId) => {
	let getData = await UserModel.find({ _id: currentUserId, following: { "$elemMatch": { userId: otherUserId } } });
	return getData;
};

const findById = async (id) => {
	let getData = await UserModel.findById(id);
	return getData;
};

const findByUserName = async (userName) => {
	let getData = await UserModel.findOne({ userName: userName });
	return getData;
};

const findByEmail = async (email) => {
	let getData = await UserModel.findOne({ email: email });
	return getData;
};

const updateData = async (data) => {
	const updatedData = await UserModel.findByIdAndUpdate(data.id, data.data, { new: true });
	return updatedData;
};

const updateByEmail = async (data) => {
	const updatedData = await UserModel.updateOne({ email: data.email }, data.updateData);
	return updatedData;
};

const updateFollowing = async (currentUser, otherUser) => {
	const updateData = await UserModel.updateOne({ _id: currentUser._id },
		{
			$inc: {
				number_of_following
					: 1
			},
			$push: {
				following: {
					userName: otherUser.userName,
					userId: otherUser._id
				}
			}
		}
	);
	return updateData;
};

const updateFollowers = async (currentUser, otherUser) => {
	const updatedUser = await UserModel.updateOne({ _id: otherUser._id }, {
		$inc: {
			number_of_followers: 1
		},
		$push: {
			followers: {
				userName: currentUser.userName,
				userId: currentUser._id
			}
		}
	});

	return updatedUser;
};

const updateFilter = async (data) => {
	const updatedFilter = await UserModel.updateOne({ _id: data.id }, {
		$push: {
			intrestFilters: {
				$each: data.filters
			}
		}
	});
	return updateFilter;
}


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
	deleteUser,
	updateByEmail,
	findByEmail,
	findIfFollowing,
	updateFollowing,
	updateFollowers,
	updateFilter
};
