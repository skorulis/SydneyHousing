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

let stores = JSON.parse(fs.readFileSync("./inputs/iga.json",'utf8'))
let coded = []

const checkSave = function() {
  console.log("check save " + coded.length)
  if (coded.length == stores.length) {
    fs.writeFile("./inputs/iga.json", JSON.stringify(coded,null,2),function(err){
    })
  }
}


for (let shop of stores) {
  if (shop.lat) {
    coded.push(shop)
    checkSave()
    continue;
  }
  geocoder.geocode(shop.address, function(err, res) {
    if (res && res.length > 0) {
      shop.lat = res[0].latitude
      shop.lng = res[0].longitude  
    }
    
    coded.push(shop)
    checkSave()
  });
  
}


