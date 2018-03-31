let gpsUtil = require("gps-util")
let fs = require('fs');
let stations = JSON.parse(fs.readFileSync("./inputs/stations.json", 'utf8'));

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

module.exports = {
  getDirectionsFilename,
  getSuburbFilename,
  getSuburbJSONFilename,
  findClosestStation
};