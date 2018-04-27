let fs = require('fs');
let helpers = require("./helperFunctions");
let HouseListing = require("./HouseListing");

let propFiles = helpers.allPropertyFiles();

let count = 0;

let overallStats = {};
let suburbStats = {};

const getSuburbStats = function(suburbName) {
  if (!suburbStats[suburbName]) {
    suburbStats[suburbName] = {};
  }
  return suburbStats[suburbName];
}

const increment = function(name,value,obj) {
  if (!obj[name]) {
    obj[name] = 0;
  }
  obj[name] += value;
}


const addStat = function(name,suburb,value) {
  let suburbStats = getSuburbStats(suburb);
  if (name === "count" || name == "withPrice" || name == "withStrata" ||
   name == "withCouncil" || name == "withSize" || name == "withScore" || name == "auction") {
    increment(name,value,overallStats)
    increment(name,value,suburbStats)
  }
}

const generateStats = function() {
  for(let file of propFiles) {
    let propJson = JSON.parse(fs.readFileSync(file));
    let property = new HouseListing(propJson)

    let metricFile = file.replace(".json","-metrics.json");
    if (fs.existsSync(metricFile)) {
      let metrics = JSON.parse(fs.readFileSync(metricFile));
      addStat("count",property.suburb(),1);
      if (property.isAuction()) {
        addStat("auction",property.suburb(),1);
      }
      if (metrics.estimatedPrice) {
        addStat("withPrice",property.suburb(),1);
      }
      if (metrics.score) {
        addStat("withScore",property.suburb(),1); 
      }
      if (metrics.costs) {
        if (metrics.costs.strata) {
          addStat("withStrata",property.suburb(),1);
        }
        if (metrics.costs.council) {
          addStat("withCouncil",property.suburb(),1); 
        }
      }
      if (metrics.size) {
        if (metrics.size.total) {
          addStat("withSize",property.suburb(),1); 
        }
      }
    }
    

  }
}

generateStats()
console.log(suburbStats);
console.log("\n");
console.log(overallStats);
