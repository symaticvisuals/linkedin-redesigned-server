const user = require("../database/services/user_crud");
const utils = require("../utils/utils");
const config = require("../utils/config");
const async = require("async");
const nodeMailer = require("nodemailer");
const userJwt = require("../classes/user/functions");
const redis = require("../redis/function");
const { transporter } = require("../utils/transporter");
const { cryptPassword, comparePassword } = require("../utils/encryptPassword");
const { defaultOptions } = require("../utils/index");
const { passwordStrength } = require("check-password-strength");
const messageBundle = require("../locales/en");
const { PassThrough } = require("nodemailer/lib/xoauth2");
require("dotenv").config();
const _ = require("lodash");


const { REDIS_PREFIX } = require("../utils/config");
const UserModel = require("../database/models/user");

exports.register = async (req, res, next) => {
	try {
		let data = req.body;

		let passStrength = passwordStrength(data.password, defaultOptions);
		if (passStrength.value === "Too weak" || passStrength.value === "Weak")
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["register.fail"],
				"",
				"password " + passStrength.value
			);

		let hashed = await cryptPassword(data.password);

		data.password = hashed;

		data.isActive = config.dbCode.active_by_admin;
		data.emailAuth = config.dbCode.email_not_Authenticated;

		// mongoose call
		let userRegisterd = await user.create(data);

		// redis check for key already exist

		let userRequested = await redis.getValue(userRegisterd.email);
		if (userRequested == 1)
			return utils.sendResponse(
				req,
				res,
				false,
				"email already requested",
				{},
				err
			);

		// generate random string for otp
		let rand = Math.floor(Math.random() * 100 + 54);
		let encodedMail = userRegisterd.email;

		// link to be sent via mail
		let link =
			"http://" +
			req.get("host") +
			"/api/user/verify?email=" +
			encodedMail +
			"&id=" +
			rand;

		console.log(link);
		let mailOptions = {
			from: process.env.NOMI_MAIL_EMAIL,
			to: userRegisterd.email,
			subject: "Email Verification",
			html: `Please click on the link to verify email <a>${link}</a>`,
		};

		transporter.sendMail(mailOptions, async function (error, info) {
			if (error) {
				return res.status(400).send("something went wrong with email");
			} else {
				console.log("Email sent: " + info.response + rand);

				// redis set key of email to randomly generated otp
				// expires key in 1 day
				await redis.setKey(userRegisterd.email, rand, config.OTP_EXPIRE_TIME);

				return utils.sendResponse(
					req,
					res,
					true,
					"email sent successfully",
					{ email: userRegisterd.email, time: config.OTP_EXPIRE_TIME },
					""
				);
			}
		});
	} catch (err) {
		utils.sendResponse(
			req,
			res,
			false,
			messageBundle["register.fail"],
			{},
			err
		);
	}
};

exports.emailAuthentication = async (req, res, next) => {
	try {
		let data = req.query;
		let emailOtp = await redis.getValue(data.email);

		if (emailOtp == null)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["emailAuthentication.fail"],
				{},
				"no such email registerd"
			);

		if (emailOtp != data.id)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["emailAuthentication.fail"],
				{},
				"Invalid Token"
			);

		await redis.deleteKey(data.email);

		let updateData = {
			email: data.email,
			updateData: {
				emailAuth: config.dbCode.emailAuthenticated,
			},
		};

		let updatedData = await user.updateByEmail(updateData);

		return utils.sendResponse(
			req,
			res,
			true,
			messageBundle["emailAuthentication.success"],
			updatedData,
			""
		);
	} catch (err) {
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		let data = req.body;
		let getUser = await user.findByEmail(data.email);
		if (getUser == null) {
			getUser = await user.findByUserName(data.email);
		}

		if (getUser == null)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["login.fail"],
				{},
				"no such user found"
			);

		let passMatch = await comparePassword(data.password, getUser.password);
		if (!passMatch)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["login.fail"],
				{},
				"password didnt match"
			);

		if (getUser.isActive == config.dbCode.inActive_by_admin)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["login.fail"],
				{},
				"admin has blocked the user"
			);
		if (getUser.emailAuth == config.dbCode.email_not_Authenticated)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["login.fail"],
				{},
				"email is not authenticated"
			);

	    let loggedIn_user = await user.updateData({id:getUser._id, data:{isLoggedIn:config.dbCode.user_logedIn}});
		let jwtToken = await userJwt.getUserJwt(loggedIn_user);

		utils.createCookie(req, res, jwtToken.data);

		// set redis key
		await redis.setKey(
			loggedIn_user._id,
			JSON.stringify(loggedIn_user),
			config.LOGIN_EXPIRE_TIME
		);

		let response = { jwt: jwtToken.data, user: loggedIn_user };
		return utils.sendResponse(
			req,
			res,
			true,
			messageBundle["user.login.welcome"],
			response,
			""
		);
	} catch (err) {
		next(err);
	}
};

exports.searchUser = async (req, res, next) => {
	try {
		const getUser = await user.findByUserName(req.params.userName);
		if (!getUser)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["search.fail"],
				{},
				"no such user"
			);

		if (getUser.isActive == config.dbCode.inActive_by_admin)
			return utils.sendResponse(
				req,
				res,
				false,
				"",
				{ userName: getUser.userName },
				"user is blocked by admin"
			);

		let response = _.omit(getUser, [
			"password"
		]);

		return utils.sendResponse(
			req,
			res,
			true,
			messageBundle["search.success"],
			response,
			""
		);
	} catch (err) {
		next(err);
	}
};

exports.getUserById = async (req, res, next) => {
	try {
		let userId = req.params.userId;

		// find the user on redis server
		let getUser = await redis.getValue(userId);

		if (getUser) {
			// if found parse the string to json
			getUser = JSON.parse(getUser);
		} else {
			// else fetch it from database
			getUser = await user.findById(userId);
		}

		if (!getUser)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["search.fail"],
				{},
				"wrong user id"
			);

		if (getUser.isActive == config.dbCode.inActive_by_admin)
			return utils.sendResponse(
				req,
				res,
				false,
				"",
				{ userName: getUser.userName },
				"user is blocked by admin"
			);

		let response = _.omit(getUser, [
			"password"
		]);

		return utils.sendResponse(
			req,
			res,
			true,
			messageBundle["search.success"],
			response,
			""
		);
	} catch (err) {
		if (err.name === "CastError")
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["search.fail"],
				{},
				"not an objectId"
			);

		next(err);
	}
};

exports.follow = async (req, res, next) => {
	try {
		let otherUserId = req.params.userId;

		if (otherUserId == req.user._id)
			return utils.sendResponse(
				req,
				res,
				false,
				"",
				{},
				"cannot follow yourself"
			);
		let otherUser = await user.findById(otherUserId);

		if (otherUser.isActive == config.dbCode.inActive_by_admin)
			return utils.sendResponse(
				req,
				res,
				false,
				"",
				{ userName: getUser.userName },
				"user is blocked by admin"
			);

		let ifAlredyFollowing = await user.findIfFollowing(
			req.user._id,
			otherUserId
		);

		if (ifAlredyFollowing.length > 0)
			return utils.sendResponse(req, res, false, "", {}, "already following");
		let updateCurrentUser = await user.updateFollowing(req.user, otherUser);

		let updateOtherUser = user.updateFollowers(req.user, otherUser);
		return utils.sendResponse(
			req,
			res,
			true,
			messageBundle["update.success"],
			{},
			""
		);
	} catch (err) {
		if (err.name === "CastError")
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["search.fail"],
				{},
				"not an objectId"
			);

		next(err);
	}
};

exports.getUserProfile = async (req, res, next) => {
	try {
		let user = await redis.getValue(req.user._id);
		user = JSON.parse(user);
		return utils.sendResponse(
			req,
			res,
			true,
			messageBundle["search.success"],
			user,
			""
		);
	} catch (err) {
		next(err);
	}
};

exports.updatMyProfiile = async (req, res, next) => {
	try {
		let data = req.body;

		let updatedUser = await user.updateData({ id: req.user._id, data: data });

		await redis.setKey(
			req.user._id,
			JSON.stringify(updatedUser),
			config.LOGIN_EXPIRE_TIME
		);

		return utils.sendResponse(
			req,
			res,
			true,
			messageBundle["update.success"],
			updatedUser,
			""
		);
	} catch (err) {
		next(err);
	}
};

exports.requestPasswordChange = async (req, res, next) => {
	try {
		let currentUser = await user.findByEmail(req.params.email);

		let otp = await redis.getValue(
			config.REDIS_PREFIX.REQUEST_PASSWORD + req.params.email
		);

		if (otp)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["update.fail"],
				{},
				"otp already requested"
			);
		if (!currentUser) {
			currentUser = await user.findByUserName(req.params.email);
		}

		if (!currentUser)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["search.fail"],
				{},
				"no such user"
			);

		// generate random string for otp
		let rand = Math.floor(Math.random() * 100 + 54);
		let encodedMail = req.params.email;

		// link to be sent via mail
		let link =
			"http://" +
			req.get("host") +
			"/api/user/changePassword?email=" +
			encodedMail +
			"&id=" +
			rand;

		console.log(link);
		let mailOptions = {
			from: process.env.NOMI_MAIL_EMAIL,
			to: req.params.email,
			subject: "Password Change Request",
			html: `Please click on the link to change password <a>${link}</a>`,
		};

		transporter.sendMail(mailOptions, async function (error, info) {
			if (error) {
				return res.status(400).send("something went wrong with email");
			} else {
				console.log("Email sent: " + info.response + rand);

				// redis set key of email to randomly generated otp
				// expires key in 1 day
				await redis.setKey("req_pass_" + req.params.email, rand, 100);

				return utils.sendResponse(
					req,
					res,
					true,
					"email sent successfully",
					{ email: req.params.email, time: 100 },
					""
				);
			}
		});
	} catch (err) {
		next(err);
	}
};

exports.changePassword = async (req, res, next) => {
	try {
		let data = req.query;
		let bodyData = req.body;

		let emailOtp = await redis.getValue(
			config.REDIS_PREFIX.REQUEST_PASSWORD + data.email
		);
		if (!emailOtp)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["emailAuthentication.fail"],
				{},
				"no such email registerd"
			);

		if (emailOtp != data.id)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["emailAuthentication.fail"],
				{},
				"Invalid Token"
			);

		if (bodyData.password != bodyData.confirmPassword)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["update.fail"],
				{},
				"password and confirm password dont match"
			);

		let passStrength = passwordStrength(bodyData.password, defaultOptions);
		if (passStrength.value === "Too weak" || passStrength.value === "Weak")
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["update.fail"],
				"",
				"password " + passStrength.value
			);

		let hashed = await cryptPassword(bodyData.password);
		console.log(hashed);
		let updateData = await user.updateByEmail({
			email: data.email,
			updateData: {
				password: hashed,
			},
		});

		// delete otp from redis as already used
		await redis.deleteKey(config.REDIS_PREFIX.REQUEST_PASSWORD + data.email);

		return utils.sendResponse(
			req,
			res,
			true,
			messageBundle["update.success"],
			updateData,
			""
		);
	} catch (err) {
		next(err);
	}
};

exports.toggleActiveUser = async (req, res, next) => {
	try {
		let userId = req.params.userId;

		// check if userprofile is set in redis
		let getUser = await redis.getValue(userId);

		if (!getUser) {
			// else fetch it from database
			getUser = await user.findById(userId);
			if (!getUser) return utils.sendResponse(req, res, false, messageBundle["search.fail"], {}, 'no such user exist');
		} else {
			// if its in redis then parse it to json
			getUser = JSON.parse(getUser);
		}

		if (getUser.isActive == config.dbCode.active_by_admin) {
			getUser.isActive = config.dbCode.inActive_by_admin;
		} else {
			getUser.isActive = config.dbCode.active_by_admin;
		}

		let updatedData = await user.updateData({
			id: userId,
			data: { isActive: getUser.isActive },
		});

		// set the updated user profile to redis key
		await redis.setKey(
			userId,
			JSON.stringify(updatedData),
			config.LOGIN_EXPIRE_TIME
		);

		return utils.sendResponse(
			req,
			res,
			true,
			messageBundle["update.success"],
			updatedData,
			""
		);
	} catch (err) {
		if (err.name === "CastError")
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["search.fail"],
				{},
				"not an objectId"
			);
		next(err);
	}
};

exports.updateProfilePicture = async (req, res, next) => {
	try {
		let imageName = req.image;
		if (!imageName)
			return utils.sendResponse(
				req,
				res,
				false,
				messageBundle["update.fail"],
				{},
				"please select an image"
			);

		let updatedData = await user.updateData({
			id: req.user._id,
			data: { profilePicture: imageName },
		});

		redis.setKey(updatedData._id, updatedData, config.LOGIN_EXPIRE_TIME);
		return utils.sendResponse(
			req,
			res,
			true,
			messageBundle["update.success"],
			updatedData,
			""
		);
	} catch (err) {
		next(err);
	}
};

exports.addSearchFilter = async (req, res, next) => {
	try {
		// search filters are of type array
		let filters = req.body.searchFilter;

		// update filters on mongoDb
		let updatedData = await user.updateFilter({
			id: req.user._id,
			filters: filters,
		});

		//    update filters on redis
		let newFilters = JSON.stringify(updatedData.intrestFilters);
		await redis.setKey(
			config.REDIS_PREFIX.SEARCH_FILTERS + req.user._id,
			newFilters,
			config.LOGIN_EXPIRE_TIME
		);

		// delete the posts which were from old filters
		await redis.deleteKey(
			config.REDIS_PREFIX.POSTS_BY_PAGES + req.user._id
		);

		return utils.sendResponse(
			req,
			res,
			true,
			messageBundle["update.success"],
			updatedData.intrestFilters,
			""
		);
	} catch (err) {
		next(err);
	}
};

exports.removeSearchFilters = async (req, res, next) => {
	try {
		// filters should come in array from frontend
		let filtersToBeRemoved = req.body.filters;

		//    check if filters are set in redis--> this happens if user ever updated the filters
		let filters = await redis.getValue(
			config.REDIS_PREFIX.SEARCH_FILTERS + req.user._id
		);

		let newFilters;

		//  if not redis then use the old ones in jwt
		if (!filters) {
			filters = req.user.intrestFilters;
		} else {
			filters = JSON.parse(filters);
		}

		for (let f of filtersToBeRemoved) {
			newFilters = filters.filter((el) => el != f);
			filters = newFilters;
		}

		await redis.setKey(
			config.REDIS_PREFIX.SEARCH_FILTERS + req.user._id,
			JSON.stringify(filters),
			config.LOGIN_EXPIRE_TIME
		);

		let updateData = await user.updateData({ id: req.user._id, data: { intrestFilters: filters } });

		return utils.sendResponse(
			req,
			res,
			true,
			messageBundle["update.success"],
			updateData,
			""
		);
	} catch (err) {
		next(err);
	}
};

exports.getSearchFilters = async (req, res, next) => {
	try {
		// get filters key from redis if user ever updated the filters in given session
		let filters = await redis.getValue(
			config.REDIS_PREFIX.SEARCH_FILTERS + req.user._id
		);

		// if not in redis take the old ones from jwt
		if (!filters) {
			filters = req.user.intrestFilters;
			console.log(filters,req.user.intrestFilters)
		} else {
			// if found redis key then parse it
			filters = JSON.parse(filters);
		}

		return utils.sendResponse(
			req,
			res,
			true,
			messageBundle["search.success"],
			filters,
			""
		);
	} catch (err) {
		next(err);
	}
};

exports.logOut = async (req, res, next) => {
	try {
		utils.createCookie(req, res, '');
 
		// change db isLoggedIn to 0
		await user.updateData({id:req.user._id, data:{isLoggedIn:config.dbCode.user_logedOut}});

        // freeing up redis space
		await redis.deleteKey(config.REDIS_PREFIX.SEARCH_FILTERS + req.user._id);
		await redis.deleteKey(config.REDIS_PREFIX.MY_POSTS + req.user._id);
		await redis.deleteKey(config.REDIS_PREFIX.POSTS_BY_PAGES + req.user._id);
		await redis.deleteKey(req.user._id);

		return res
			.clearCookie("access_token")
			.status(200)
			.json({ message: "Successfully logged out 😏 🍀" });
	} catch (err) {
		next(Err);
	}
};

/**
 * get random users for profile based on designation 
 * also added pagination 10 users per page by default
 * get user designation from redis
 */
exports.getRandomUsers = async(req,res,next)=>{
	try{
		let {page=1, limit=10} = req.query;
		let currentUser = JSON.parse(await redis.getValue(
			 req.user._id
		));

       let getData = await user.getRandomUsers(page, limit,currentUser.designation);
	   return utils.sendResponse(req, res, true, messageBundle["search.success"], getData, '');
	}catch(err){
		next(err);
	}
}

exports.set_section_intro = async(req,res,next)=>{
	try{
      const postData = await user.updateIntro({id:req.user._id, intro:req.body.intro});
	  await redis.setKey(req.user._id,JSON.stringify(postData), config.LOGIN_EXPIRE_TIME);
	return utils.sendResponse(req, res, true, messageBundle["update.success"],postData, '');
	}catch(err){
		next(err);
	}
}
exports.set_section_backgroundPoster = async(req, res, next)=>{
	try{
       const updateData = await user.updateBackgroundPoster({id:req.user._id,image:req.image });
	   await redis.setKey(req.user._id,JSON.stringify(updateData), config.LOGIN_EXPIRE_TIME);

	   return utils.sendResponse(req,res,true, messageBundle["update.success"], updateData, '');
	}catch(err){
		next(err);
	}
}

exports.getAllUsers = async(req,res,next)=>{
  try{
     const {page=1, limit=10} = req.query;
	 const getData = await user.find({page, limit});
	 return utils.sendResponse(req, res, true, messageBundle["search.success"], getData, '');
  }catch(err){
	  next(err);
  }
}