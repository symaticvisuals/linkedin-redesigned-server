const config = require('../utils/config');
const userJwt = require('../classes/user/functions');
const adminJwt = require('../classes/admin/functions');
const utils = require('../utils/utils');
const messageBundle = require('../locales/en');

exports.isUserJwt = async (req, res, next) => {
    try {
        let jwtToken = req.body.jwtToken || req.cookies.access_token;
        // console.log(jwtToken.data);
        let payload = await userJwt.decodeJwt(jwtToken.data);
        req.user = payload.data;
        next();
    } catch (err) {
        return utils.sendResponse(req, res, false, messageBundle['jwtDecode.fail'], {}, err);
    }
}
exports.isAdminJwt = async (req, res, next) => {
    try {
        let jwtToken = req.body.jwtToken || req.cookies.access_token;
        let payload = await adminJwt.decodeToken(jwtToken);
        req.user = payload.data;
        next();
    } catch (err) {
        return utils.sendResponse(req, res, false, messageBundle['jwtDecode.fail'], {}, err);
    }
}