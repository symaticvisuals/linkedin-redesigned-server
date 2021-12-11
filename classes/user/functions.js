const jwt = require('jwt-simple');
const config = require('../../utils/config');
const _ = require('lodash');
const utils = require('../../utils/utils');
const moment = require('moment');
require('dotenv').config();

exports.getUserJwt = async (userData) => {
    let jwtData = _.pick(userData, ["_id", "email", "userName"]);
    jwtData.expireTime = moment() + config.LOGIN_EXPIRE_TIME;
    jwtData.access = config.ACCESS.USER;
    let jwtToken = jwt.encode(jwtData, process.env.NOMI_USER_JWTKEY);
    return utils.classResponse(true, jwtToken, '');
}

exports.decodeJwt = async (jwtToken) => {
    let payload = jwt.decode(jwtToken, process.env.NOMI_USER_JWTKEY);
    return utils.classResponse(true, payload, '');

}