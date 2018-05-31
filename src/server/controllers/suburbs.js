let helpers = require("../../helperFunctions");
let fs = require('fs');
let HouseListing = require("../../model/HouseListing");
let propertyStats = require("../../algo/propertyStats");
let hateoas = require("../routes/apiHAL")()
let propertyController = require("./properties");

const sortSuburbs = function(a,b) {
  if (a.maxScore && b.minScore) {
    return b.maxScore - a.maxScore;
  }
  if (a.maxSimpleScore && b.maxSimpleScore) {
    return b.maxSimpleScore - a.maxSimpleScore;
  }
  return b.count - a.count;
}

const compareProperties = function(a,b) {
  if (a.score && b.score) {
    return b.score - a.score;
  }

  if (a.simpleScore && b.simpleScore) {
    return b.simpleScore - a.simpleScore;
  }

  if (a.score || a.simpleScore) {
    return -1;
  }
  if (b.score || b.simpleScore) {
    return 1;
  }

  if (a.costs && b.costs && a.costs.yearly && b.costs.yearly) {
    return b.costs.yearly - a.costs.yearly;
  }
  return 0;
}

const listSuburbs = function(req,res,next) {
  let stats = propertyStats.generateStats()
  let suburbs = stats.suburbs;
  for (let name in suburbs) {
    let sub = suburbs[name]
    hateoas.link("suburb",sub)
  }
  let suburbsArray = [];
  for (let key in suburbs) {
    suburbsArray.push(suburbs[key])
  }

  suburbsArray = suburbsArray.sort(sortSuburbs);

  res.send(suburbsArray)
}

const suburbProperties = function(req,res,nex) {
  let suburbName = req.params["suburb"].toLowerCase()
  let propFiles = helpers.allPropertyFiles();
  let properties = [];
  for(let file of propFiles) {
    let propJson = JSON.parse(fs.readFileSync(file));
    let property = new HouseListing(propJson)

    if (property.suburb().toLowerCase() === suburbName) {
      let obj = propertyController.getPropertyJson(file);
      if (obj) {
        properties.push(obj);
      }
      
    }
  }
  properties = properties.sort(compareProperties);
  res.send(properties);
}

module.exports = {
  listSuburbs,
  suburbProperties
}