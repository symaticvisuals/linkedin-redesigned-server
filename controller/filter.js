const Filter = require('../database/services/filter_crud');
const config = require('../utils/config');
const utils = require('../utils/utils');
const messagebundle = require('../locales/en');

exports.createFilter = async(req,res,next)=>{
    try {
        const data = req.body;
        const postData= await Filter.create({name:data.name});
        return utils.sendResponse(req,res,true,messagebundle['insert.success'], postData);
    } catch (err) {
        next(err);
    }
}

exports.getAllFilters = async(req, res, next)=>{
    try {
        const {page=1, limit=10} = req.query;
        const getData = await Filter.getAll({page, limit});
        return utils.sendResponse(req, res, true , messagebundle['search.success'], getData, '');
    } catch (err) {
        next(err);
    }
}
exports.getById = async(req, res, next)=>{
    try {
        const getData = await Filter.getById(req.params.filterId);
        return utils.sendResponse(req, res, true , messagebundle['search.success'], getData, '');
    } catch (err) {
        next(err);
    }
}


exports.updateFilterName = async(req, res, next)=>{
    try{
      const {filterId, name} = req.body;
      const putData = await Filter.updateFilterName({id:filterId, name});
      return utils.sendResponse(req,res,true,messagebundle['update.success'], putData, ''); 
    }catch(err){
        next(err);
    }
}

exports.toggleActive = async(req, res, next)=>{
    try{
      const filterId = req.params.filterId;
      let filter = await Filter.getById(filterId);

      if(!filter) return utils.sendResponse(req,res,false, messagebundle['search.fail'], {}, 'no such filter found');

      if(filter.isActive == config.dbCode.filter_active){
          filter.isActive = config.dbCode.filter_inActive;
      }else{
          filter.isActive = config.dbCode.filter_active;
      }

      const putData = await Filter.updateActive({id:filterId, active:filter.isActive});

      return utils.sendResponse(req,res,true,messagebundle['update.success'], putData, ''); 


    }catch(err){
        next(err);
    }
}