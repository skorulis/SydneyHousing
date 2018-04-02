let gpsUtil = require("gps-util")
let fs = require('fs');
let fetch = require("node-fetch")
let stations = JSON.parse(fs.readFileSync("./inputs/stations.json", 'utf8'));
let supermarkets = JSON.parse(fs.readFileSync("./inputs/supermarkets.json", 'utf8'));
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

const getKey = function(name) {
  return keys[name]
}

const getDirections = async function(from,to,mode) {
  let arrival = new Date('09:00 2018.04.04').getTime() / 1000;
  let baseURL = "https://maps.googleapis.com/maps/api/directions/json";
  let url = `${baseURL}?origin=${from},Sydney&destination=${to}&mode=${mode}&key=AIzaSyBSBzblLqx5_i0y-WjijmeDDW-NKuFnSDc&arrival_time=${arrival}`;

  console.log(url);

  let response = await fetch(url);
  let json = await response.json()

  delete json["routes"][0]["legs"][0]["steps"]
  delete json["routes"][0]["overview_polyline"]

  return json;
}

module.exports = {
  getDirectionsFilename,
  getSuburbFilename,
  getSuburbJSONFilename,
  findClosestStation,
  findClosestSupermarket,
  getKey,
  getDirections
};