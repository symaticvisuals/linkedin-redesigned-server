const user = require('../database/services/user_crud');
const utils = require('../utils/utils');
const config = require('../utils/config');
const async = require('async');
const nodeMailer = require('nodemailer');

//io redis is a redis client for node
const Redis = require('ioredis');
const redis = new Redis(); //uses default configuration i.e localhost and port 6379
const { transporter } = require('../utils/transporter');
const { cryptPassword, comparePassword } = require('../utils/encryptPassword');
const { defaultOptions } = require('../utils/index');
const { passwordStrength } = require('check-password-strength');
const messageBundle = require('../locales/en');
require('dotenv').config();

exports.register = async (req, res, next) => {

    async.waterfall([
        function (callback) {

            let data = req.body;

            let passStrength = passwordStrength(data.password, defaultOptions);
            if (passStrength.value === "Too weak" || passStrength.value === "Weak")
                return utils.sendResponse(req, res, false, messageBundle['register.fail'], '', "password " + passStrength.value);

            cryptPassword(data.password).then((res) => {
                let hashed = res;
                data.password = hashed;

                data.isActive = config.dbCode.active_by_admin;
                data.emailAuth = config.dbCode.email_not_Authenticated;

                let userRegisterd = {};

                // mongoose call
                user.create(data).then((res) => {
                    userRegisterd = res;
                    callback(null, userRegisterd);
                }).catch((err) => {
                    // mongoose catch
                    return callback(true, err);
                })
            }).catch((err) => {
                // hashed catch
                return callback(true, err);

            })
        },
        // redis check for key already exist
        function (userRegisterd, callback) {
            redis.exists(userRegisterd.email, (err, reply) => {
                if (err) return utils.sendResponse(req, res, false, 'error in redis', {}, err);

                if (reply == 1) return utils.sendResponse(req, res, false, 'email already requested', {}, err);

                callback(null, userRegisterd);
            })
        },
        function (userRegisterd, callback) {
            let rand = Math.floor((Math.random() * 100) + 54);
            let encodedMail = userRegisterd.email;
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
                    redis.set(userRegisterd.email, rand);
                    // expires key in 1 day
                    redis.expire(userRegisterd.email, config.OTP_EXPIRE_TIME);
                    return utils.sendResponse(req, res, true, 'email sent successfully', { email: userRegisterd.email, time: config.OTP_EXPIRE_TIME }, '')
                }
            });
        }

    ], function (err, data) {
        console.log(err, data);
        return utils.sendResponse(req, res, false, messageBundle['register.fail'], err, data);

    })


};
