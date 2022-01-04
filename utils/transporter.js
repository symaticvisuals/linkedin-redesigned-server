const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = {
    transporter: nodemailer.createTransport({
        service: "hotmail",
        auth: {
            user: process.env.NOMI_MAIL_EMAIL,
            pass: process.env.NOMI_MAIL_PASSWORD
        },
    })
}