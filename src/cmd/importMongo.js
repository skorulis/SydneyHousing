const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let dbURL = "mongodb://localhost/housing";

mongoose.connect(dbURL,{useNewUrlParser:true});
let db = mongoose.connection;


function doImport() {
	console.log("Import data")
}

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("Connect to database " + dbURL)
	doImport()
});