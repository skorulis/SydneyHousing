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

const propertySortScore = function(prop) {
  let total = 0;
  if (prop.score) {
    total += prop.score;
  } else if (prop.simpleScore) {
    total += prop.simpleScore;
  } else {
    total += -500;
  }

  if (prop.eliminated && prop.eliminated.length > 0) {
    total -= 1000;
  }

  return total;
}

const compareProperties = function(a,b) {
  let s1 = propertySortScore(a);
  let s2 = propertySortScore(b);
  
  return s2 - s1;
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