let fs = require('fs');
let helpers = require("./helperFunctions");
let NodeGeocoder = require('node-geocoder');

let apiKey = helpers.getKey("googleGeocode");

let options = {
  provider: 'google',
  apiKey: apiKey
};

let geocoder = NodeGeocoder(options);

let suburbs = JSON.parse(fs.readFileSync('./inputs/all-suburbs.json', 'utf8'))
let coded = [];

const checkSave = function() {
  //console.log("check save " + coded.length)
  if (coded.length == suburbs.length) {
    coded = coded.sort(function(a,b) {
      return a.name.localeCompare(b.name);
    });


    fs.writeFile("./inputs/all-suburbs.json", JSON.stringify(coded,null,2),function(err){
    })
  }
}

for (let sub of suburbs) {
  if (sub.lat) {
    coded.push(sub)
    checkSave()
    continue;
  }
  console.log("Geocode " + sub.name)

  geocoder.geocode(sub.name + ",Sydney", function(err, res) {
    if (err) {
      console.log(err)
    }
    if (res && res.length > 0) {
      sub.lat = res[0].latitude
      sub.lng = res[0].longitude  
    }
    
    coded.push(sub)
    checkSave()
  });
}