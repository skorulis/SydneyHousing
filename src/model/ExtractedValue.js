let mongoose = require('mongoose');

let schema = new mongoose.Schema({
	value:String,
	text:String,
	isEstimated:{type:Boolean,default:false},
	_id:false
});

module.exports = {
  schema: schema,
  model: mongoose.model('ExtractedValue',schema)
};