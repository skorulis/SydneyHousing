let fs = require('fs');
let helpers = require("./helperFunctions");
let NodeGeocoder = require('node-geocoder');

let apiKey = helpers.getKey("googleGeocode");

let options = {
  provider: 'google',
  apiKey: apiKey
};

let geocoder = NodeGeocoder(options);

let shops = JSON.parse(fs.readFileSync("./inputs/woolworths.json", 'utf8'))
let coded = [];

const checkSave = function() {
  if (coded.length == shops.length) {
    fs.writeFile("./inputs/woolworths3.json", JSON.stringify(coded,null,2),function(err){

    });
  }
}

for (let shop of shops) {
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


/*let woolworths = fs.readFileSync("./inputs/woolworths.txt", 'utf8').split("\n");

let shops = []
let currentShop;
let state = 0;
let address = "";




for (let line of woolworths) {
  if (line == "SUPERMARKETS") {
    currentShop = {};
    state = 1;
  } else if (state == 1) {
    currentShop["name"] = line
    state = 2;
  } else if (state == 2) {
    state = 3;
  } else if (state == 3) {
    address = line
    state = 4;
  } else if (state == 4) {
    address = address + line
    currentShop["address"] = address;
    shops.push(currentShop);  
    state = 0;
  }

}

fs.writeFile("./inputs/woolworths.json", JSON.stringify(shops,null,2),function(err){

});*/