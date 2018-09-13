let mongoose = require('mongoose');

let schema = new mongoose.Schema({
	name:String,
	mode:String,
	duration:Number,
	distance:Number,
	_id:false
});

module.exports = {
  schema: schema,
  model: mongoose.model('TravelTime',schema)
};