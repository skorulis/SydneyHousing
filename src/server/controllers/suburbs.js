let helpers = require("../../helperFunctions");
let fs = require('fs');
let HouseListing = require("../../model/HouseListing");
let propertyStats = require("../../algo/propertyStats");


const listSuburbs = function(req,res,next) {
  let stats = propertyStats.generateStats()
  res.send(stats.suburbs)
}

const suburbProperties = function(req,res,nex) {
  let suburbName = req.params["suburb"].toLowerCase()
  let propFiles = helpers.allPropertyFiles();
  let properties = [];
  for(let file of propFiles) {
    let propJson = JSON.parse(fs.readFileSync(file));
    let property = new HouseListing(propJson)
    if (property.suburb().toLowerCase() === suburbName) {
      properties.push(property)
    }
  }
  res.send(properties);
}

module.exports = {
  listSuburbs,
  suburbProperties
}