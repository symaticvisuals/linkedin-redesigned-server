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

module.exports = {
    classResponse,
    sendResponse
}