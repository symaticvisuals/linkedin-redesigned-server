const {Mongoose, SchemaTypes, model, Schema} = require('../db');
const config = require('../../utils/config');

const filterSchema = new Schema({
    name:{type:SchemaTypes.String, required:true, trim:true},
    isActive:{type:SchemaTypes.Number, default:config.dbCode.filter_active}
},{
    timestamps:true
});

const FilterModel = model(config.SCHEMAS.FILTER, filterSchema);

module.exports = FilterModel;