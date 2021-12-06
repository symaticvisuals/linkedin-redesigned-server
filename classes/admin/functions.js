const jwt = require('jwt-simple');
const _ = require('lodash');
const moment = require('moment');
const config = require('../../utils/config');
const utils = require('../../utils/utils');
require('dotenv').config();

exports.getAdminJwt = async (loginData) => {
    let jwtData = _.pick(loginData, ['auth', '_id']);
    jwtData.expireTime = moment() + config.LOGIN_EXPIRE_TIME;
    let jwtToken = jwt.encode(jwtData, process.env.NOMI_ADMIN_JWTKEY);
    return utils.classResponse(true, jwtToken, '');
}

exports.decodeToken = async (token) => {
    let payload = jwt.decode(token, process.env.NOMI_ADMIN_JWTKEY);
    return utils.classResponse(true, payload, '');
}