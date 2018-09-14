const mongoose = require('mongoose');
const Property = require("../model").Property
const HouseListing = require("../model/HouseListing")
const helpers = require("../helperFunctions")
const fs = require("fs")

mongoose.Promise = global.Promise;

let dbURL = "mongodb://localhost/housing";

mongoose.connect(dbURL,{useNewUrlParser:true});
let db = mongoose.connection;


function doImport() {
	let propFiles = helpers.allPropertyFiles();
	console.log("Import data")
	for (let file of propFiles) {
		let propJson = JSON.parse(fs.readFileSync(file));
    	let property = new HouseListing(propJson)
		let metrics = property.metricsJSON();
		console.log(property)
		break;
	}


	db.close()
}

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("Connect to database " + dbURL)
	doImport()
});