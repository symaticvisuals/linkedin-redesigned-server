const admin = require('../database/services/admin_crud');
const { STATUS_CODES } = require('../utils/config');
const messageBundle = require('../locales/en');
const utils = require('../utils/utils');
const { defaultOptions } = require("../utils/index");
const { passwordStrength } = require("check-password-strength");
const { cryptPassword, comparePassword } = require('../utils/encryptPassword');
const _ = require('lodash');
const adminFunctions = require('../classes/admin/functions');
require('dotenv').config();

exports.register = async (req, res, next) => {
    try {
        let data = req.body;
        let passStrength = passwordStrength(data.password, defaultOptions);

        if (passStrength.value === "Too weak" || passStrength.value === "Weak")
            return utils.sendResponse(req, res, false, messageBundle['register.fail'], '', "password " + passStrength.value)

        let hashedPassword = await cryptPassword(data.password);

        let adminObj = {
            personalInfo: {
                name: data.name,
                mobile: data.mobile,
                type: data.type,
                tags: data.tags
            },
            auth: {
                userName: data.userName,
                pass: hashedPassword
            }
        }
        let newAdmin = await admin.create(adminObj);
        return utils.sendResponse(req, res, true, messageBundle['register.welcome'], _.pick(newAdmin, ['personalInfo', '_id']), '');
    } catch (err) {
        return utils.sendResponse(req, res, false, messageBundle['register.fail'], '', err);

    }
}

exports.login = async (req, res, next) => {
    try {
        let data = req.body;
        let adminFound = await admin.findByUserName(data.userName);
        if (!adminFound) return utils.sendResponse(req, res, false, messageBundle['login.fail'], {}, 'no such admin found');

        let passMatch = await comparePassword(data.password, adminFound.auth.pass);

        if (!passMatch) return utils.sendResponse(req, res, false, messageBundle['login.fail'], {}, 'password didnt match');

        let jwtToken = adminFunctions.getAdminJwt(adminFound);

        res.cookie("access_token", (await jwtToken).data, {
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production'
        })
        let response = {
            jwtToken: (await jwtToken).data,
            userName: data.userName,
            id: adminFound._id
        };

        return utils.sendResponse(req, res, true, messageBundle['admin.login.welcome'], response, '')
    } catch (err) {
        next(err);
    }
}