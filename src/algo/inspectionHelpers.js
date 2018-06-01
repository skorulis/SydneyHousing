let fs = require('fs');
let gpsUtil = require("gps-util");

let helpers = require("../helperFunctions");
let HouseListing = require("../model/HouseListing");

let inspectionDate = new Date('09:00 2018.06.02');

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

function findAllInspections(suburb) {
  let allinspections = []
  for(let file of propFiles) {
    let propJson = JSON.parse(fs.readFileSync(file));
    let property = new HouseListing(propJson)

    if (!property.json.address.location) {
      continue;
    }

    if (suburb) {
      let distance = gpsUtil.getDistance(suburb.lng,suburb.lat,property.longitude(),property.latitude())

      if (distance > 2000) {
        continue;
      }  
    }
    

    let inspections = property.inspections();
    inspections = inspections.filter(function(x) {
      let startTimestamp = Date.parse(x.startTime)
      let startTime = new Date(startTimestamp);
      return sameDay(inspectionDate,startTime);
    })

    for(let i of inspections) {
      i.propertyId = property.id();
      i.suburb = property.suburb();
      i.url = property.url()
      i.address = property.address()
      i.latitude = property.latitude()
      i.longitude = property.longitude()
      allinspections.push(i);
    }
  }
  return allinspections;
}

module.exports = {
  findAllInspections
}