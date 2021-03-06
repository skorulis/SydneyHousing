let helpers = require("../../helperFunctions");
let fs = require('fs');
let HouseListing = require("../../model/HouseListing");
let propertyStats = require("../../algo/propertyStats");
let hateoas = require("../routes/apiHAL")
let propertyController = require("./properties");
let propertyFilter = require("../../algo/propertyFilter")

const getSuburbRanking = function(suburb) {
  let sold = suburb.sold || 0;
  let removed = suburb.removed || 0;
  let available = suburb.count - sold - removed;

  return (available * 5) + sold + removed;
}

const sortSuburbs = function(a,b) {
  return b.rankScore - a.rankScore;
  /*if (a.maxScore && b.minScore) {
    return b.maxScore - a.maxScore;
  }
  if (a.maxSimpleScore && b.maxSimpleScore) {
    return b.maxSimpleScore - a.maxSimpleScore;
  }
  return b.count - a.count;*/
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
  if (prop.isSold) {
    total -= 2000;
  }
  if (prop.missing) {
    total -= 2000;
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
    let subDetails = helpers.getSuburb(name);
    if (subDetails) {
      sub.postcode = subDetails.postcode;  
    }
    hateoas(req.headers.host).link("suburb",sub)
  }
  let suburbsArray = [];
  for (let key in suburbs) {
    suburbsArray.push(suburbs[key])
  }
  for (let sub of suburbsArray) {
    sub.rankScore = getSuburbRanking(sub);
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
      let obj = propertyController.getPropertyJson(file,req.headers.host);
      if (obj) {
        properties.push(obj);
      }
      
    }
  }
  properties = properties.sort(compareProperties);
  res.send(properties);
}

const allProperties = function(req,res,nex) {
  filter = req.body["filter"];
  let propFiles = helpers.allPropertyFiles();
  let properties = [];
  for(let file of propFiles) {
    let json = propertyController.getPropertyJson(file,req.headers.host);
    if (json && propertyFilter.matchesFilter(filter,json)) {
      properties.push(json);  
    }
  }
  properties = properties.sort(compareProperties);
  res.send(properties);
}

module.exports = {
  listSuburbs,
  suburbProperties,
  allProperties
}