let fs = require('fs');
let gpsUtil = require("gps-util");

let helpers = require("./helperFunctions");
let HouseListing = require("./HouseListing");

let inspectionDate = new Date('09:00 2018.04.21');
let suburbName = process.argv[2]

let suburb = helpers.getSuburb(suburbName)
console.log(suburb)

let propFiles = helpers.allPropertyFiles();

function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function printResult(property,inspections) {
  console.log(property.address())
  console.log(property.url())
  console.log(inspections)
}

for(let file of propFiles) {
  let propJson = JSON.parse(fs.readFileSync(file));
  let property = new HouseListing(propJson)

  if (!property.json.address.location) {
    console.log("No location for " + property.address());
    continue;
  }

  let distance = gpsUtil.getDistance(suburb.lng,suburb.lat,property.longitude(),property.latitude())

  if (distance > 3000) {
    continue;
  }

  let inspections = property.inspections();
  inspections = inspections.filter(function(x) {
    let startTimestamp = Date.parse(x.startTime)
    let startTime = new Date(startTimestamp);
    return sameDay(inspectionDate,startTime);
  })

  if (inspections.length > 0) {
    printResult(property,inspections)
  }

}