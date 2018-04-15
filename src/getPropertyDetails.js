let fs = require('fs');
let fetch = require("node-fetch")
let helpers = require("./helperFunctions");
let HouseListing = require("./HouseListing");
let gpsUtil = require("gps-util")

let params = JSON.parse(fs.readFileSync("./inputs/params.json", 'utf8'));

let onTheHouseAuth = "Bearer 1ba2f663-0995-4e99-afa7-cbdca58c2315";

const downloadProperty = async function(propertyId) {
  let url = "https://services.realestate.com.au/services/listings/withIds?id=" + propertyId;

  let response = await fetch(url);
  let json = await response.json()
  let propertyJson = json.results[0]

  let listing = new HouseListing(propertyJson)

  console.log(url)

  return listing
}

const downloadHistory = async function(address) {
  console.log(address);
  let searchURL = "https://mobile-api.othsolutions.com.au/location/locations?query=" + address;
  console.log(searchURL)

  let headers = {"Authorization": onTheHouseAuth};

  let response = await fetch(searchURL);
  let json = await response.json()
  if (json.content.length > 0) {
    let first = json.content[0];
    console.log("Looking up " + first.formattedAddress);
    let onTheHouseId = first.propertyId;
    let historyURL = "https://mobile-api.othsolutions.com.au/property/properties/"+onTheHouseId+"/events?page.sort=date&page.sort.dir=desc";
    console.log(historyURL)

    response = await fetch(historyURL,{headers:headers});
    return await response.json()
  }

  return null
}

const getInternalSize = function(listing) {
  let p1 = /internal size: (\d{2,4})sqm/i;
  let m1 = listing.description().match(p1)
  if (m1) {
    return {value:m1[1],text:m1[0]}
  }
  return null;
}

const calculateMetrics = async function(listing,history) {
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

  obj.size = {}
  obj.size.internal = getInternalSize(listing)

  if (history) {
    obj.pastSales = history.content;
  }

  return obj

}

const evaluateProperty = async function(propertyId) {
  let property = await downloadProperty(propertyId);
  property.save()

  let history = null;
  /*if (property.hasLocation()) {
    history = await downloadHistory(property.address())
    let filename = property.filename().replace(".json","-history.json");
    fs.writeFile(filename, JSON.stringify(history,null,2),function(err){});
  }*/

  let metrics = await calculateMetrics(property,history)
  let filename = property.filename().replace(".json","-metrics.json");
  fs.writeFile(filename, JSON.stringify(metrics,null,2),function(err){});

  console.log(metrics)
}

evaluateProperty(process.argv[2])