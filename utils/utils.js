const classResponse = (success, data, err) => {
    return {
        success,
        data,
        error: err
    }
}

const sendResponse = (req, res, success, data, err) => {
    return res.json({
        success,
        data,
        error: err
    })
}

module.exports = {
    classResponse,
    sendResponse
}