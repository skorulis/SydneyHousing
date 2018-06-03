let fs = require('fs');
let fetch = require("node-fetch")
let helpers = require("../helperFunctions");
let HouseListing = require("../model/HouseListing");
let gpsUtil = require("gps-util")
let scoreFunctions = require("./scoreFunctions")

let params = JSON.parse(fs.readFileSync("./inputs/params.json", 'utf8'));

let onTheHouseAuth = "Bearer 1ba2f663-0995-4e99-afa7-cbdca58c2315";
let numberExtractor = require("./numberExtractor")

let stats = helpers.getPropertyStats()

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
  let strata = numberExtractor.getStrata(listing.description())
  if (!strata) {
    if (listing.type() === "house") {
      return {value:"0",text:"house"}
    } else if (listing.type() === "villa") {
      return {value:"300",text:"villa"}
    } 
  }
  
  return strata
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
    obj = {shop:shop,station:station,visited:false};
    obj.size = {};
    obj.costs = {};
    obj.features = [];
    
  }
  if (!obj.travel) {
    obj.travel = [];
    for (let loc of params.locations) {
      let directions = await helpers.getDirections(listing.address(),loc.name,loc.mode)
      obj.travel.push(helpers.condenseDirections(directions,loc.name,loc.mode));
    }
  }

  obj.firstSeen = obj.firstSeen || new Date();
  obj.lastUpdated = new Date();
  
  if (!obj.shop.travel) {
    let to = obj.shop.lat + "," + obj.shop.lng;
    let directions = await helpers.getDirections(listing.address(),to,"walking");
    obj.shop.travel = helpers.condenseDirections(directions,to,"walking");
  }

  let nearbyPubs = helpers.findPubsNear(lat,lng,1000)
  obj.pubs = {count1KM:nearbyPubs.length}
  if (nearbyPubs.length > 0) {
    let pub = nearbyPubs[0]
    delete pub.contact;
    delete pub.categories;
    delete pub.stats;
    delete pub.location.labeledLatLngs;
    delete pub.beenHere;
    delete pub.specials;
    obj.pubs.local = pub
    
  }

  obj.size.internal = getInternalSize(listing) || oldSize.internal;
  obj.size.land = getLandSize(listing) || oldSize.land;
  obj.size.total = getTotalSize(listing) || oldSize.total;

  obj.costs.strata =  getStrata(listing) || oldCosts.strata;
  obj.costs.council = getCouncilRates(listing) || oldCosts.council || stats.avgCouncilObj(listing.suburb());
  obj.costs.water = getWaterRates(listing) || oldCosts.water || stats.avgWaterObj(listing.suburb());

  obj.estimatedPrice = listing.priceEstimate() || obj.estimatedPrice;
  obj.isSold = listing.isSold();
  obj.suburb = listing.suburb();
  obj.underOffer = listing.isUnderOffer();
  obj.features = extractFeatures(listing,obj.features)

  calculatePropertyCosts(obj);

  if (history) {
    obj.pastSales = history.content;
  }

  return obj

}

const extractFeatures = function(listing,oldFeatures) {
  return []
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
  let shopCost = (metrics.shop.travel.duration/60) * 48 * 6 * params.hourValue;

  metrics.costs.virtual.travel = parseFloat(travelCost.toFixed(0));
  metrics.costs.virtual.shopping = parseFloat(shopCost.toFixed(0));

  metrics.score = scoreFunctions.calculateSizeScore(metrics);
  metrics.simpleScore = scoreFunctions.calculateSimpleScore(metrics);

}

const evaluateProperty = async function(propertyId) {
  let property = await downloadProperty(propertyId);
  let oldMetrics = property.metricsJSON()
  
  property.save()

  let history = null;
  /*if (property.hasLocation()) {
    history = await downloadHistory(property.address())
    let filename = property.filename().replace(".json","-history.json");
    fs.writeFile(filename, JSON.stringify(history,null,2),function(err){});
  }*/
  try {
    let metrics = await calculateMetrics(property,history,oldMetrics)
    fs.writeFileSync(metricsFilename, JSON.stringify(metrics,null,2),function(err){});
    return metrics
  } catch (error) {
    console.log(error);
  }
   
}

module.exports = {
  evaluateProperty
}

//evaluateProperty(process.argv[2])