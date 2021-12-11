const user = require('../database/services/user_crud');
const utils = require('../utils/utils');
const config = require('../utils/config');
const async = require('async');
const nodeMailer = require('nodemailer');
const userJwt = require('../classes/user/functions');
const redis = require('../redis/function');
const { transporter } = require('../utils/transporter');
const { cryptPassword, comparePassword } = require('../utils/encryptPassword');
const { defaultOptions } = require('../utils/index');
const { passwordStrength } = require('check-password-strength');
const messageBundle = require('../locales/en');
const { PassThrough } = require('nodemailer/lib/xoauth2');
require('dotenv').config();
const _ = require('lodash');

exports.register = async (req, res, next) => {
    try {

        let data = req.body;

        let passStrength = passwordStrength(data.password, defaultOptions);
        if (passStrength.value === "Too weak" || passStrength.value === "Weak")
            return utils.sendResponse(req, res, false, messageBundle['register.fail'], '', "password " + passStrength.value);

        let hashed = await cryptPassword(data.password);

        data.password = hashed;

        data.isActive = config.dbCode.active_by_admin;
        data.emailAuth = config.dbCode.email_not_Authenticated;

        // mongoose call
        let userRegisterd = await user.create(data);

        // redis check for key already exist

        let userRequested = await redis.getValue(userRegisterd.email);
        if (userRequested == 1) return utils.sendResponse(req, res, false, 'email already requested', {}, err);

        // generate random string for otp
        let rand = Math.floor((Math.random() * 100) + 54);
        let encodedMail = userRegisterd.email;

        // link to be sent via mail
        let link = "http://" + req.get('host') + "/verify?mail=" + encodedMail + "&id=" + rand;

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

                return utils.sendResponse(req, res, true, 'email sent successfully', { email: userRegisterd.email, time: config.OTP_EXPIRE_TIME }, '')
            }
        });
    } catch (err) {
        utils.sendResponse(req, res, false, messageBundle['register.fail'], {}, err);
    }
};

exports.emailAuthentication = async (req, res, next) => {
    try {
        let data = req.query;

        let emailOtp = await redis.getValue(data.email);

        if (emailOtp == null) return utils.sendResponse(req, res, false, messageBundle['emailAuthentication.fail'], {}, 'no such email registerd');

        if (emailOtp != data.id) return utils.sendResponse(req, res, false, messageBundle['emailAuthentication.fail'], {}, 'Invalid Token');

        await redis.deleteKey(data.email);

        let updateData = {
            email: data.email,
            updateData: {
                emailAuth: config.dbCode.emailAuthenticated
            }
        };

        let updatedData = await user.updateByEmail(updateData);

        return utils.sendResponse(req, res, true, messageBundle['emailAuthentication.success'], updatedData, '');
    } catch (err) {
        next(err);
    }
}

exports.login = async (req, res, next) => {
    try {
        let data = req.body;
        let getUser = await user.findByEmail(data.email);
        if (getUser == null) {
            getUser = await user.findByUserName(data.email);
        }

        if (getUser == null) return utils.sendResponse(req, res, false, messageBundle['login.fail'], {}, 'no such user found');

        let passMatch = await comparePassword(data.password, getUser.password);
        if (!passMatch) return utils.sendResponse(req, res, false, messageBundle['login.fail'], {}, 'password didnt match');

        if (getUser.isActive == config.dbCode.inActive_by_admin) return utils.sendResponse(req, res, false, messageBundle['login.fail'], {}, 'admin has blocked the user');
        if (getUser.emailAuth == config.dbCode.email_not_Authenticated) return utils.sendResponse(req, res, false, messageBundle['login.fail'], {}, 'email is not authenticated');

        let jwtToken = await userJwt.getUserJwt(getUser);

        res.cookie("access_token", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production'
        });

        let response = { jwt: jwtToken.data, user: getUser };
        return utils.sendResponse(req, res, true, messageBundle['user.login.welcome'], response, '');


    } catch (err) {
        next(err);
    }
}

exports.searchUser = async (req, res, next) => {
    try {
        const getUser = await user.findByUserName(req.params.userName);
        if (!getUser) return utils.sendResponse(req, res, false, messageBundle['search.fail'], {}, 'no such user');

        if (getUser.isActive == config.dbCode.inActive_by_admin) return utils.sendResponse(req, res, false, '', { userName: getUser.userName }, 'user is blocked by admin');

        let response = _.pick(getUser, ["email", "firstName", "lastName", "designation", "userName", "education", "profilePic"]);

        return utils.sendResponse(req, res, true, messageBundle['search.success'], response, '');
    } catch (err) {
        next(err);
    }
}

exports.getUserById = async (req, res, next) => {
    try {
        let userId = req.params.userId;
        let getUser = await user.findById(userId);

        if (!getUser) return utils.sendResponse(req, res, false, messageBundle['search.fail'], {}, 'wrong user id');

        if (getUser.isActive == config.dbCode.inActive_by_admin) return utils.sendResponse(req, res, false, '', { userName: getUser.userName }, 'user is blocked by admin');

        let response = _.pick(getUser, ["email", "firstName", "lastName", "designation", "userName", "education", "profilePic"]);

        return utils.sendResponse(req, res, true, messageBundle['search.success'], response, '');

    } catch (err) {
        if (err.name === 'CastError')
            return utils.sendResponse(req, res, false, messageBundle['search.fail'], {}, 'not an objectId');

        next(err);
    }
}

exports.follow = async (req, res, next) => {
    try {
        let otherUserId = req.params.userId;

        if (otherUserId == req.user._id) return utils.sendResponse(req, res, false, '', {}, 'cannot follow yourself');
        let otherUser = await user.findById(otherUserId);

        if (otherUser.isActive == config.dbCode.inActive_by_admin) return utils.sendResponse(req, res, false, '', { userName: getUser.userName }, 'user is blocked by admin');

        let ifAlredyFollowing = await user.findIfFollowing(req.user._id, otherUserId);

        if (ifAlredyFollowing.length > 0) return utils.sendResponse(req, res, false, '', {}, 'already following');
        let updateCurrentUser = await user.updateData({
            id: req.user._id, data: {
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
        });

        let updateOtherUser = user.updateData({
            id: otherUserId, data: {
                $inc: {
                    number_of_followers: 1
                },
                $push: {
                    followers: {
                        userName: req.user.userName,
                        userId: req.user._id
                    }
                }
            }
        });
        console.log(updateCurrentUser);
        return utils.sendResponse(req, res, true, messageBundle['update.success'], ifFollowing, '');
    } catch (err) {
        if (err.name === 'CastError')
            return utils.sendResponse(req, res, false, messageBundle['search.fail'], {}, 'not an objectId');

        next(err);
    }
}