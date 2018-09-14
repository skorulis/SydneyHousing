let mongoose = require('mongoose');
let travelSchema = require("./TravelTime").schema;
let valueSchema = require("./ExtractedValue").schema;

let schema = new mongoose.Schema({
	realestateId:String,
	shop:{
		name:String,
		address:String,
		lat:Number,
		lng:Number,
		type:String,
		distance:Number,
		travel:travelSchema
	},
	station:{
		name:String,
		latDec:Number,
		lngDec:Number,
		distance:Number
	},
	costs: {
		council:valueSchema,
		water:valueSchema,
		strata:valueSchema
	},
	travel:[travelSchema],
	visited:Boolean,
	firstSeen:String, //TODO: replace with timestamps
	lastUpdated:String,
	nextInspection:String,
	estimatedPrice:Number,
	isSold:Boolean,
	suburb:String,
	underOffer:Boolean,
	auctionDate:String,
	roomDetails:String,
	score:{type:Number,default:null},
	simpleScore:{type:Number,default:null},
	eliminated:{type:String,default:null},
	renovations:{type:String,default:null},
	comments:{type:String,default:null},
	rating:{type:Number,default:null}
});

module.exports = {
  schema: schema,
  model: mongoose.model('Property',schema)
};