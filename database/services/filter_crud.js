const config = require('../../utils/config');
const Filter = require('../models/filter');

/**
 * 
 * @param {{name:string}} obj 
 */
const create = async(obj)=>{
   const createData = await Filter.create(obj);
   return createData;
}
/**
 * 
 * @param {{page:String, limit:String}} obj 
 */
const getAll = async(obj)=>{
  let page = parseInt(obj.page);
  let limit = parseInt(obj.limit);
  let skip = (page-1)*limit;

  const getData = await Filter.find().limit(limit).skip(skip);
  return getData;
}

/**
 * 
 * @param {mongoId} id 
 * @returns 
 */
const getById = async(id)=>{
    const getData = await Filter.findById(id);
    return getData;
}
/**
 * 
 * @param {{id:mongoId, active:int}} data 
 */
const updateActive = async(data)=>{
    const updateData = await Filter.findByIdAndUpdate(data.id, {isActive:data.active},{new:true});
    return updateData;
}

/**
 * 
 * @param {{id:mongoId, name:String}} data 
 */
const updateFilterName = async(data)=>{
    const updateData = await Filter.findByIdAndUpdate(data.id, {name:data.name}, {new:true});
    return updateData;
}

module.exports = {
    create,
    getAll,
    getById,
    updateActive,
    updateFilterName,
}