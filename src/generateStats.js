let fs = require('fs');
let helpers = require("./helperFunctions");
let gpsUtil = require("gps-util")
let suburbs = fs.readFileSync('./inputs/suburbs.txt', 'utf8').split("\n");
const cheerio = require('cheerio');
let params = JSON.parse(fs.readFileSync("./inputs/params.json", 'utf8'));

const toNumber = function(text) {
  return parseInt(text.replace("$","").replace(/,/g,""))
}

const getTravelParam = function(name,mode) {
  for (let loc of params.locations) {
    if (loc.name == name && loc.mode == mode) {
      return loc;
    }
  }
}

const generateStats = function(suburb) {
  let obj = {name:suburb,travel:[]};

  for (let loc of params.locations) {
    let locFilename = helpers.getDirectionsFilename(suburb,loc.name,loc.mode)
    let locJSON = JSON.parse(fs.readFileSync(locFilename, 'utf8'));
    let locData = locJSON["routes"][0]["legs"][0]
    let locResult = {name:loc.name,mode:loc.mode};
    locResult["duration"] = Math.round(locData["duration"]["value"] / 60);
    locResult["distance"] = locData["distance"]["value"] / 1000;
    obj.travel.push(locResult)

    let gps = locData["start_location"];
    let lat = gps["lat"]
    let lng = gps["lng"]

    let best = helpers.findClosestStation(lat,lng)
    let stationDistance = gpsUtil.getDistance(lng,lat,best.lngDec,best.latDec)
    obj["closestStation"] = best.name;
    obj["stationDistance"] = parseFloat((stationDistance/1000).toFixed(2));
  }

  let profileFilename = helpers.getSuburbJSONFilename(suburb);
  let profileJson = JSON.parse(fs.readFileSync(profileFilename, 'utf8'));

  obj["profile"] = profileJson;

  return obj
}

const generateAllStats = function() {
  let allStats = [];
  let limit = 1000;

  for(let suburb of suburbs) {
    allStats.push(generateStats(suburb))
    if (allStats.length > limit) {
      return allStats
    }
  }

  return allStats;
}

const calculateValue = function(obj) {
  let total = 0;
  for (let t of obj.travel) {
    let loc = getTravelParam(t.name,t.mode)
    total += loc.weight * t.duration;
  }
  for (let p of params.prices) {
    let dict = obj.profile;
    let max = p.max
    let div = p.weightDivider
    for (let k of p.keyPath) {
      dict = dict[k]
    }
    let value = toNumber(dict);
    
    if (!Number.isNaN(value)) {
      total += (value - max) / div;  
    }
    
  }

  return total;
}

const hasAcceptableTravel = function(obj) {
  for (let t of obj.travel) {
    let loc = getTravelParam(t.name,t.mode)
    if (t.duration > loc.max) {
      return false;
    }
  }
  return true
}

const hasAcceptableMedianPrice = function(obj) {
  let hasValue = false;
  for (let p of params.prices) {
    let dict = obj.profile;
    let max = p.max
    for (let k of p.keyPath) {
      dict = dict[k]
    }
    let value = toNumber(dict);
    if (!Number.isNaN(value)) {
      hasValue = hasValue || value <= max;
    }
  }
  return hasValue
}

const isAcceptable = function(obj) {
  return hasAcceptableTravel(obj) && hasAcceptableMedianPrice(obj)
}

const sortResults = function(stats) {
  return stats.sort(function(a,b) {
    return calculateValue(a) - calculateValue(b);
  })
}


let stats = generateAllStats();
stats = stats.filter(isAcceptable);
stats = sortResults(stats);

for (let s of stats) {
  console.log(s.name)
}


fs.writeFile("./results/stats/stats.json", JSON.stringify(stats,null,2),function(err){

});

