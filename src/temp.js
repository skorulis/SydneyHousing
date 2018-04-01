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

let colesData = fs.readFileSync("./scrapes/coles.htm", 'utf8')
let $ = cheerio.load(colesData);

let places = $(".storeAddress")

let stores = [];
let coded = [];

const checkSave = function() {
  if (coded.length == stores.length) {
    fs.writeFile("./inputs/coles.json", JSON.stringify(coded,null,2),function(err){
    })
  }
}

places.each(function(index,element) {
  let name = $(this).children("h3").text()
  let address = $(this).children(".storeStreet").text()
  let parts = address.split("\n").splice(1,2)
  parts = parts.map(x => x.trim())
  address = parts.join(" ")

  console.log(address)
  console.log("---")

  let obj = {name:name,address:address}
  stores.push(obj)

  //console.log($(this).text())
});


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
