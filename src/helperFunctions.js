let gpsUtil = require("gps-util")
let fs = require('fs');
let fetch = require("node-fetch")
let stations = JSON.parse(fs.readFileSync("./inputs/stations.json", 'utf8'));
let supermarkets = JSON.parse(fs.readFileSync("./inputs/supermarkets.json", 'utf8'));
let pubs = JSON.parse(fs.readFileSync("./inputs/pubs.json", 'utf8'));
let keys = JSON.parse(fs.readFileSync("./keys/keys.json", 'utf8'));

const getDirectionsFilename = function(from,to,mode) {
  return `./results/${mode}/${from}-${to}.json`;
}

const getSuburbFilename = function(suburb) {
  return `./results/suburbs/${suburb}.html`;
}

const getSuburbJSONFilename = function(suburb) {
  return `./results/suburb-json/${suburb}.json`; 
}

const getSuburb = function(name) {
  let subs = JSON.parse(fs.readFileSync('./inputs/all-suburbs.json', 'utf8'));
  for (let s of subs) {
    if (s.name.toUpperCase() == name.toUpperCase()) {
      return s
    }
  }
  return null;
}

const findClosestStation = function(lat,lon) {
  let best;
  let bestDistance = 100000
  for (let s of stations) {
    let distance = gpsUtil.getDistance(lon,lat,s.lngDec,s.latDec)
    if (distance < bestDistance) {
      best = s;
      bestDistance = distance;
    }
  }
  return best
}

const findClosestSupermarket = function(lat,lon) {
  let best;
  let bestDistance = 100000
  for (let s of supermarkets) {
    let distance = gpsUtil.getDistance(lon,lat,s.lng,s.lat)
    if (distance < bestDistance) {
      best = s;
      bestDistance = distance;
    }
  }
  return best
}

const findPubsNear = function(lat,lon,radius) {
  let close = []
  for (let p of pubs) {
    let dist = gpsUtil.getDistance(lon,lat,p.location.lng,p.location.lat)
    if (dist < radius) {
      p.dist = dist
      close.push(p);
    }
  }
  close = close.sort((a,b) => {return a.dist - b.dist})

  return close;
}

const getKey = function(name) {
  return keys[name]
}

const getDirections = async function(from,to,mode) {
  let arrival = new Date('09:00 2018.04.30').getTime() / 1000;
  let baseURL = "https://maps.googleapis.com/maps/api/directions/json";
  let key = getKey("googleDirections");
  let url = `${baseURL}?origin=${from},Sydney&destination=${to}&mode=${mode}&key=${key}&arrival_time=${arrival}`;

  console.log(url);

  let response = await fetch(url);
  let json = await response.json()

  delete json["routes"][0]["legs"][0]["steps"]
  delete json["routes"][0]["overview_polyline"]

  return json;
}

const condenseDirections = function(directions,to,mode) {
  let locData = directions["routes"][0]["legs"][0]
  let locResult = {name:to,mode:mode};
  locResult["duration"] = Math.round(locData["duration"]["value"] / 60);
  locResult["distance"] = locData["distance"]["value"] / 1000;
  return locResult
}

const allPropertyFiles = function() {
  let rootDir = "./results/properties";
  let props = [];

  let dirs = fs.readdirSync(rootDir);
  for (let i = 0; i < dirs.length; ++i) { 
      let suburbDir = rootDir + "/" + dirs[i];
      let files = fs.readdirSync(suburbDir)
      for (let j = 0; j < files.length; ++j) { 
        let file = files[j]
        if (file.indexOf("-metrics.json") == -1 && file.indexOf("-history.json") == -1) {
          let fullname = suburbDir + "/" + file;
          props.push(fullname)
        }
      }
    }
  return props;
}

module.exports = {
  getDirectionsFilename,
  getSuburbFilename,
  getSuburbJSONFilename,
  findClosestStation,
  findClosestSupermarket,
  getKey,
  getDirections,
  condenseDirections,
  findPubsNear,
  allPropertyFiles,
  getSuburb
};