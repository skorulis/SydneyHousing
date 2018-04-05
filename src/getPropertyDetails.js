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
  let shopDistance = gpsUtil.getDistance(lng,lat,shop.lng,shop.lat) 
  shop["distance"] = parseFloat((shopDistance/1000).toFixed(2));
  
  let station = helpers.findClosestStation(lat,lng)
  let stationDistance = gpsUtil.getDistance(lng,lat,station.lngDec,station.latDec)
  station["distance"] = parseFloat((stationDistance/1000).toFixed(2));

  let obj = {shop:shop,station:station,travel:[]}
  for (let loc of params.locations) {
    let directions = await helpers.getDirections(listing.address(),loc.name,loc.mode)
    let locData = directions["routes"][0]["legs"][0]
    let locResult = {name:loc.name,mode:loc.mode};
    locResult["duration"] = Math.round(locData["duration"]["value"] / 60);
    locResult["distance"] = locData["distance"]["value"] / 1000;
    obj.travel.push(locResult);
  }

  let nearbyPubs = helpers.findPubsNear(lat,lng,1000)
  obj.pubs = {count1KM:nearbyPubs.length}
  if (nearbyPubs.length > 0) {
    obj.pubs.local = nearbyPubs[0]
  }

  return obj

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