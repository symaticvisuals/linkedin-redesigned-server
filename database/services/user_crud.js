const UserModel = require("../models/user");
const config = require('../../utils/config');
const { Mongoose, SchemaType } = require("mongoose");

const create = async (createObj) => {
	let userData = await UserModel.create(createObj);
	return userData;
};

/**
 * 
 * @param {{page:string, limit:string}} obj 
 * @returns 
 */
const find = async (obj) => {
	let page = parseInt(obj.page);
	let limit = parseInt(obj.limit);
	let skip = (page-1)*limit;

	let getData = await UserModel.find().limit(limit).skip(skip);
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

/**
 * 
 * @param {{userId:mongoId, postId}} obj 
 */
const findIfBookMarked = async(obj)=>{
  const getData = await UserModel.findOne({_id:obj.userId, post_bookmarks:{
	  $elemMatch:{
		  postId:obj.postId
	  }}});
	  return getData;
}

/**
 * 
 * @param {{id:mongoId, data:obj}} data 
 * @returns 
 */
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
	const updatedFilter = await UserModel.findByIdAndUpdate(data.id, { intrestFilters: data.filters }, { new: true });
	return updatedFilter;
}

/**
 * @param {{userId:mongoId,postId:mongoId, image:string, message:string}} data
 */
const updateBookmarks_inc = async(data)=>{
	const updateData = await UserModel.findOneAndUpdate({_id:data.userId },{
		$inc:{number_of_postBookmarks:1},
		$push:{post_bookmarks:{message:data.message, image:data.image, postId:data.postId}}
	}, {new:true});
	return updateData;
  }

/**
 * @param {{userId:mongoId, postId:mongoId}} data
 */
const updateBookmarks_dec = async(data)=>{
	const updateData = await UserModel.findOneAndUpdate({_id:data.userId,
		post_bookmarks:{
			$elemMatch:{
				postId:data.postId
			}
		} },{
		$inc:{number_of_postBookmarks:-1},
		$pull:{post_bookmarks:{postId:data.postId}}
	}, {new:true});
	return updateData;
  }



/**
 * 
 * @param {{intro:string, id:mongoId}} obj
 * @returns {Object}
 */
const updateIntro = async(obj)=>{
  const updateData = await UserModel.findByIdAndUpdate(obj.id, {"section.intro":obj.intro},{new:true});
  return updateData;
}

/**
 * 
 * @param {{id:mongodbId, image:string}} obj
 * @returns 
 */
const updateBackgroundPoster = async(obj)=>{
	const updateData = await UserModel.findByIdAndUpdate(obj.id, {"section.backgroundPoster":obj.image}, {new:true});
	return updateData;
}
const deleteUser = async (id) => {
	const updatedData = await UserModel.findByIdAndUpdate(id, { isActive: config.dbCode.inActive_by_admin });
	return updateData;
}


/**
 * get random users according to designation
 * also added pagination 
 */

const getRandomUsers = async(page, limit, designation)=>{
	limit = parseInt(limit);
	let skip = (limit) * (parseInt(page)-1);
	const getData = await UserModel.find({isActive:config.dbCode.active_by_admin, designation:designation}, {username:1, designation:1,profilePicture:1,firstName:1, lastName:1, isLoggedIn:1 }, {limit:limit, skip:skip});
	return getData;
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
	findIfBookMarked,
	updateFollowing,
	updateFollowers,
	updateFilter,
	updateIntro,
	updateBackgroundPoster,
	updateBookmarks_inc,
	updateBookmarks_dec,
	getRandomUsers
};
