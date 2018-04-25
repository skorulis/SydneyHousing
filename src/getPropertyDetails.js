let fs = require('fs');
let fetch = require("node-fetch")
let helpers = require("./helperFunctions");
let HouseListing = require("./HouseListing");
let gpsUtil = require("gps-util")

let params = JSON.parse(fs.readFileSync("./inputs/params.json", 'utf8'));

let onTheHouseAuth = "Bearer 1ba2f663-0995-4e99-afa7-cbdca58c2315";
let numberExtractor = require("./algo/numberExtractor")


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

const getBodyMatch = function(listing,regex) {
  let m1 = listing.description().match(regex)
  if (m1) {
    return {value:m1[1],text:m1[0]}
  }
  return null;
}

const getInternalSize = function(listing) {
  return numberExtractor.getInternalSize(listing.description())
}

const getTotalSize = function(listing) {
  return numberExtractor.getTotalSize(listing.description());
}

const getStrata = function(listing) {
  return numberExtractor.getStrata(listing.description())
}

const getCouncilRates = function(listing) {
  return numberExtractor.getCouncilRates(listing.description())
}

const getWaterRates = function(listing) {
  return numberExtractor.getWaterRates(listing.description());
}

const getLandSize = function(listing) {
  let landSize = listing.landSize();
  if (landSize) {
    return {value:landSize.value,text:landSize.displayApp};
  }
  return null;
}

const calculateMetrics = async function(listing,history,oldMetrics) {
  let lat = listing.latitude();
  let lng = listing.longitude();
  let shop = helpers.findClosestSupermarket(lat,lng)
  let shopDistance = gpsUtil.getDistance(lng,lat,shop.lng,shop.lat) 
  shop["distance"] = parseFloat((shopDistance/1000).toFixed(2));
  
  let station = helpers.findClosestStation(lat,lng)
  let stationDistance = gpsUtil.getDistance(lng,lat,station.lngDec,station.latDec)
  station["distance"] = parseFloat((stationDistance/1000).toFixed(2));

  let obj;
  let oldSize = {};
  let oldCosts = {};
  if(oldMetrics) {
    obj = oldMetrics;
    oldMetrics.size = oldMetrics.size || {};
    oldMetrics.costs = oldMetrics.costs || {};
    oldSize = oldMetrics.size;
    oldCosts = oldMetrics.costs;
  } else {
    obj = {shop:shop,station:station,travel:[]};
    obj.size = {};
    obj.costs = {};

    for (let loc of params.locations) {
      let directions = await helpers.getDirections(listing.address(),loc.name,loc.mode)
      let locData = directions["routes"][0]["legs"][0]
      let locResult = {name:loc.name,mode:loc.mode};
      locResult["duration"] = Math.round(locData["duration"]["value"] / 60);
      locResult["distance"] = locData["distance"]["value"] / 1000;
      obj.travel.push(locResult);
    }
  }
  obj.firstSeen = obj.firstSeen || new Date();
  

  let nearbyPubs = helpers.findPubsNear(lat,lng,1000)
  obj.pubs = {count1KM:nearbyPubs.length}
  if (nearbyPubs.length > 0) {
    obj.pubs.local = nearbyPubs[0]
  }

  obj.size.internal = getInternalSize(listing) || oldSize.internal;
  obj.size.land = getLandSize(listing) || oldSize.land;
  obj.size.total = getTotalSize(listing) || oldSize.total;

  obj.costs.strata =  getStrata(listing) || oldCosts.strata;
  obj.costs.council = getCouncilRates(listing) || oldCosts.council;
  obj.costs.water = getWaterRates(listing) || oldCosts.water;

  obj.estimatedPrice = listing.priceEstimate()

  calculatePropertyCosts(obj);

  if (history) {
    obj.pastSales = history.content;
  }

  return obj

}

const calculatePropertyCosts = async function(metrics) {
  if (metrics.estimatedPrice) {
    let interest = (metrics.estimatedPrice - params.deposit) * params.interestRate;
    metrics.costs.interest = interest; 
  }

  if(metrics.costs.strata && metrics.costs.council && metrics.costs.water) {
    let fixed = metrics.costs.strata.value * 4;
    fixed += metrics.costs.council.value * 4;
    fixed += metrics.costs.water.value * 4;
    metrics.costs.fixed = parseFloat(fixed.toFixed(0));
  }

  if (metrics.costs.interest && metrics.costs.fixed) {
    metrics.costs.yearly = metrics.costs.interest + metrics.costs.fixed;
  }
  
  metrics.costs.virtual = {};


  let travelCost = 0;
  for (let t of metrics.travel) {
    let cost = (t.duration / 60) * 48 * 10 * params.hourValue;
    travelCost += cost / metrics.travel.length;
  }
  metrics.costs.virtual.travel = parseFloat(travelCost.toFixed(0));

}

const evaluateProperty = async function(propertyId) {
  let property = await downloadProperty(propertyId);
  let metricsFilename = property.filename().replace(".json","-metrics.json");
  let oldMetrics = null;
  if (fs.existsSync(metricsFilename)) {
    oldMetrics = JSON.parse(fs.readFileSync(metricsFilename, 'utf8'));  
  }
  

  property.save()

  console.log(property.description())

  let history = null;
  /*if (property.hasLocation()) {
    history = await downloadHistory(property.address())
    let filename = property.filename().replace(".json","-history.json");
    fs.writeFile(filename, JSON.stringify(history,null,2),function(err){});
  }*/
  try {
    let metrics = await calculateMetrics(property,history,oldMetrics)
    console.log(metrics)  
    fs.writeFile(metricsFilename, JSON.stringify(metrics,null,2),function(err){});
  } catch (error) {
    console.log(error);
  }
  
  

  
}

evaluateProperty(process.argv[2])