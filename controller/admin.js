const admin = require('../database/services/admin_crud');
const { STATUS_CODES } = require('../utils/config');
const messageBundle = require('../locales/en');
const utils = require('../utils/utils');

exports.register = async (req, res, next) => {
    try {
        let data = req.body;
        let adminObj = {
            personalInfo: {
                name: data.name,
                mobile: data.mobile,
                type: data.type,
                tags: data.tags
            },
            auth: {
                userName: data.userName,
                pass: data.password
            }
        }
        let newAdmin = await admin.create(adminObj);
        return utils.sendResponse(req, res, true, newAdmin, '');
    } catch (err) {
        return utils.sendResponse(req, res, false, '', err);

    }
}

