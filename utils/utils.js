const classResponse = (success, data, err) => {
    return {
        success,
        data,
        error: err
    }
}

const sendResponse = (req, res, success, message, data, err) => {
    return res.json({
        success,
        message,
        data,
        error: err
    })
}

// change secure to true when in testing >>> heroku
const createCookie = (req, res, data) => {
    res.cookie("access_token", data, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });
}

module.exports = {
    classResponse,
    sendResponse,
    createCookie
}