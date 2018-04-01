let fs = require('fs');
let helpers = require("./helperFunctions");
let NodeGeocoder = require('node-geocoder');
let cheerio = require("cheerio")

let apiKey = helpers.getKey("googleGeocode");

let options = {
  provider: 'google',
  apiKey: apiKey
};

let geocoder = NodeGeocoder(options);


let aldi = JSON.parse(fs.readFileSync("./inputs/aldi.json"));
let coles = JSON.parse(fs.readFileSync("./inputs/coles.json"));
let woolworths = JSON.parse(fs.readFileSync("./inputs/woolworths.json"));

let allStores = [];

for (let x of aldi) {
  x["type"] = "aldi";
  allStores.push(x);
}

for (let x of coles) {
  x["type"] = "coles";
  allStores.push(x);
}

for (let x of woolworths) {
  x["type"] = "woolworths";
  allStores.push(x);
}

fs.writeFile("./inputs/supermarkets.json", JSON.stringify(allStores,null,2),function(err){
})