let helpers = require("../../helperFunctions");
let fs = require('fs');
let HouseListing = require("../../model/HouseListing");
let propertyStats = require("../../algo/propertyStats");
let hateoas = require("../routes/apiHAL")()

const listSuburbs = function(req,res,next) {
  let stats = propertyStats.generateStats()
  let suburbs = stats.suburbs;
  for (let name in suburbs) {
    let sub = suburbs[name]
    hateoas.link("suburb",sub)
  }
  res.send(suburbs)
}

const suburbProperties = function(req,res,nex) {
  let suburbName = req.params["suburb"].toLowerCase()
  let propFiles = helpers.allPropertyFiles();
  let properties = [];
  for(let file of propFiles) {
    let propJson = JSON.parse(fs.readFileSync(file));
    let property = new HouseListing(propJson)

    if (property.suburb().toLowerCase() === suburbName) {
      let obj = {url:property.url(),sold:property.isSold()}
      obj["id"] = property.id()
      
      let metricFile = file.replace(".json","-metrics.json");
      if (fs.existsSync(metricFile)) {
        let metrics = JSON.parse(fs.readFileSync(metricFile));
        obj["estimatedPrice"] = metrics.estimatedPrice;
        obj["visited"] = metrics.visited || false;
        obj["fistSeen"] = metrics.firstSeen;
        obj["image"] = property.imageURL();
        obj["address"] = property.address();
      }

      hateoas.link("property",obj)
      properties.push(obj);
    }
  }
  res.send(properties);
}

module.exports = {
  listSuburbs,
  suburbProperties
}