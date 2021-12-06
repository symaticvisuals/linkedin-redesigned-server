const AdminModel = require('../models/admin');

const create = async (createObj) => {
    let createData = await AdminModel.create(createObj);
    return createData;
}

const find = async () => {
    let getData = await AdminModel.find();
    return getData;
}

const findById = async (id) => {
    let getData = await AdminModel.findById(id);
    return getData;
}

const findByUserName = async (userName) => {
    let getData = await AdminModel.findOne({ 'auth.userName': userName });
    return getData;
}

const updateData = async (data) => {
    const updatedData = await AdminModel.findByIdAndUpdate(data.id, data);
    return updatedData;
}

module.exports = {
    create,
    find,
    findById,
    findByUserName,
    updateData
}