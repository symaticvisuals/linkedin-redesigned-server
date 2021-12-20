const config = require("../utils/config");
const userJwt = require("../classes/user/functions");
const adminJwt = require("../classes/admin/functions");
const utils = require("../utils/utils");
const messageBundle = require("../locales/en");

exports.isUserJwt = async (req, res, next) => {
	try {
		let jwtToken =
			req.body.jwtToken ||
			req.cookies.access_token ||
			req.headers["access_token"];
		// console.log(jwtToken);
		// console.log(req.headers);
		let payload = await userJwt.decodeJwt(jwtToken);
		payload.data.role = config.ACCESS.USER;

		req.user = payload.data;
		next();
	} catch (err) {
		return utils.sendResponse(
			req,
			res,
			false,
			messageBundle["jwtDecode.fail"],
			{},
			err
		);
	}
};
exports.isAdminJwt = async (req, res, next) => {
	try {
		let jwtToken =
			req.body.jwtToken ||
			req.cookies.access_token ||
			req.headers["access_token"];

		// console.log(req.cookies);
		let payload = await adminJwt.decodeToken(jwtToken);
		payload.data.role = config.ACCESS.ADMIN;
		req.user = payload.data;
		next();
	} catch (err) {
		return utils.sendResponse(
			req,
			res,
			false,
			messageBundle["jwtDecode.fail"],
			{},
			err
		);
	}
};
