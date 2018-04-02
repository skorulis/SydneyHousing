let fs = require('fs');
let fetch = require("node-fetch")
let helpers = require("./helperFunctions");
let HouseListing = require("./HouseListing");
let gpsUtil = require("gps-util")

let params = JSON.parse(fs.readFileSync("./inputs/params.json", 'utf8'));

const downloadProperty = async function(propertyId) {
  let url = "https://services.realestate.com.au/services/listings/withIds?id=" + propertyId;

  let response = await fetch(url);
  let json = await response.json()
  let propertyJson = json.results[0]

  let listing = new HouseListing(propertyJson)

  console.log(url)

  return listing
}

const calculateMetrics = async function(listing) {
  let lat = listing.latitude();
  let lng = listing.longitude();
  let shop = helpers.findClosestSupermarket(lat,lng)
  shop["distance"] = gpsUtil.getDistance(lng,lat,shop.lng,shop.lat) 

  return {shop:shop}

}

const evaluateProperty = async function(propertyId) {
  let property = await downloadProperty(propertyId);
  property.save()
  let metrics = await calculateMetrics(property)
  let filename = property.filename().replace(".json","-metrics.json");
  fs.writeFile(filename, JSON.stringify(metrics,null,2),function(err){
    
  });

  console.log(metrics)
}

evaluateProperty(process.argv[2])