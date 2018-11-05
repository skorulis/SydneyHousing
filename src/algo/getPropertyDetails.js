let fs = require('fs');
let fetch = require("node-fetch")
let helpers = require("../helperFunctions");
let HouseListing = require("../model/HouseListing");
let gpsUtil = require("gps-util")
let scoreFunctions = require("./scoreFunctions")
let eliminator = require("./propertyEliminator");

let params = JSON.parse(fs.readFileSync("./inputs/params.json", 'utf8'));

let onTheHouseAuth = "Bearer 1ba2f663-0995-4e99-afa7-cbdca58c2315";
let numberExtractor = require("./numberExtractor")

let stats = helpers.getPropertyStats()

const downloadProperty = async function(propertyId) {
  let url = "https://services.realestate.com.au/services/listings/withIds?id=" + propertyId;
  console.log(url)
  let response = await fetch(url);
  let json = await response.json()
  if (json.totalResultsCount === 0) {
    let oldData = helpers.getPropertyById(propertyId);
    oldData.json.missing = true;
    return oldData
  }
  let propertyJson = json.results[0]
  let listing = new HouseListing(propertyJson)

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
    obj.missing = false;
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
  obj.nextInspection = listing.nextInspection();
  
  if (!obj.shop.travel) {
    let to = obj.shop.lat + "," + obj.shop.lng;
    let directions = await helpers.getDirections(listing.address(),to,"walking");
    obj.shop.travel = helpers.condenseDirections(directions,to,"walking");
  }

  /*let nearbyPubs = helpers.findPubsNear(lat,lng,1000)
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
  } */

  obj.size.internal = getInternalSize(listing) || oldSize.internal;
  obj.size.land = getLandSize(listing) || oldSize.land;
  obj.size.total = getTotalSize(listing) || oldSize.total;

  obj.costs.strata =  getStrata(listing) || oldCosts.strata;
  obj.costs.council = getCouncilRates(listing) || oldCosts.council || stats.avgCouncilObj(listing.suburb());
  obj.costs.water = getWaterRates(listing) || oldCosts.water || stats.avgWaterObj(listing.suburb());


  if (!obj.price && obj.estimatedPrice) {
    obj.price = {estimate:obj.estimatedPrice}
    if (obj.originalPrice) {
      if (obj.originalPrice > obj.estimatedPrice) {
        obj.price.high = obj.originalPrice;
      } else {
        obj.price.low = obj.originalPrice;
      }
    }
  }

  if (obj.price) {
    obj.price = numberExtractor.mergePriceValues(obj.price,listing.priceObject())
  } else {
    obj.price = listing.priceObject()  
  }
  

  let price = listing.priceEstimate();
  if (obj.estimatedPrice && price && !obj.originalPrice) {
    if (obj.estimatedPrice != price) {
      obj.originalPrice = obj.estimatedPrice;
      obj.estimatedPrice = price;
    }
  } else {
    obj.estimatedPrice = price || obj.estimatedPrice;
  }
  obj.isSold = listing.isSold();
  obj.suburb = listing.suburb();
  obj.underOffer = listing.isUnderOffer();
  obj.auctionDate = listing.auctionDate();
  obj.features = extractFeatures(listing,obj.features)
  obj.roomDetails = listing.roomDetails();

  calculatePropertyCosts(obj);
  if (!oldMetrics) {
    obj.eliminated = eliminator.getEliminationReason(listing,obj);
  }

  if (history) {
    obj.pastSales = history.content;
  }

  return obj

}

const extractFeatures = function(listing,oldFeatures) {
  return oldFeatures
}

const findFeature = function(name) {
  for (let p of params.features) {
    if (p.name === name) {
      return p;
    }
  }
  return null;
}

const getParamValue = function(param,selection) {
  for (let opt of param.options) {
    if (opt.optionName === selection) {
      return opt.value;
    }
  }
  return 0;
}

const calculatePropertyCosts = async function(metrics) {
  let totalOutlay = metrics.estimatedPrice;
  if (metrics.price) {
    if (metrics.price.sold) {
      totalOutlay = metrics.price.sold
    } else if (metrics.price.estimate) {
      totalOutlay = metrics.price.estimate;
    }
  }

  if (totalOutlay) {
    if (metrics.renovations) {
      totalOutlay += parseFloat(metrics.renovations);
    }
    let interest = (totalOutlay - params.deposit) * params.interestRate;
    metrics.costs.interest = interest; 
  }

  metrics.costs.virtual = {};

  if(metrics.features) {
    let totalFeatureValue = 0;
    for(let key in metrics.features) {
      let param = findFeature(key);
      totalFeatureValue += getParamValue(param,metrics.features[key])

      console.log(key);
      console.log(metrics.features[key]);
    }
    metrics.costs.virtual.features = -totalFeatureValue;
  } else {
    metrics.costs.virtual.features = 0;
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
  if (property.isMissing()) {
    console.log("FOUND MISSING PROPERTY")
    if (oldMetrics) {
      oldMetrics.missing = true;
      fs.writeFileSync(property.metricsFilename(), JSON.stringify(oldMetrics,null,2),function(err){});
    }
    return oldMetrics;
  }

  property.save()

  let history = null;
  /*if (property.hasLocation()) {
    history = await downloadHistory(property.address())
    let filename = property.filename().replace(".json","-history.json");
    fs.writeFile(filename, JSON.stringify(history,null,2),function(err){});
  }*/
  try {
    let metrics = await calculateMetrics(property,history,oldMetrics)
    fs.writeFileSync(property.metricsFilename(), JSON.stringify(metrics,null,2),function(err){});
    return metrics
  } catch (error) {
    console.log(error);
  }
   
}

module.exports = {
  evaluateProperty
}

//evaluateProperty(process.argv[2])