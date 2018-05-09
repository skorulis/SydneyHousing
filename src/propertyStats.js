let fs = require('fs');
let helpers = require("./helperFunctions");
let HouseListing = require("./model/HouseListing");

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

const max = function(name,value,obj) {
  if (!obj[name]) {
    obj[name] = value
  }
  obj[name] = Math.max(value,obj[name])
}

const min = function(name,value,obj) {
  if (!obj[name]) {
    obj[name] = value
  }
  obj[name] = Math.min(value,obj[name])
}

const addStat = function(name,suburb,value) {
  let suburbStats = getSuburbStats(suburb);
  if (name === "count" || name == "withPrice" || name == "withStrata" ||
      name === "withWater" ||
      name == "withCouncil" || name == "withSize" || name == "withScore" || 
      name == "auction" || name === "withAllCosts") {
    increment(name,value,overallStats)
    increment(name,value,suburbStats)
  } else if (name === "maxCouncil" || name === "maxWater") {
    max(name,value,overallStats)
    max(name,value,suburbStats)
  } else if (name === "minCouncil" || name === "minWater") {
    min(name,value,overallStats)
    min(name,value,suburbStats)
  } else {
    console.log("ERROR: unknown stat " + name)
  }
}

const addMultiStat = function(name,suburb,value) {
  let suburbStats = getSuburbStats(suburb);
  if (name === "council") {
    addStat("withCouncil",suburb,1);
    addStat("maxCouncil",suburb,value);
    addStat("minCouncil",suburb,value);
  } else if (name === "water") {
    addStat("withWater",suburb,1);
    addStat("maxWater",suburb,value);
    addStat("minWater",suburb,value);
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
      let costParamCount = 0;
      if (property.isAuction()) {
        addStat("auction",property.suburb(),1);
      }
      if (metrics.estimatedPrice) {
        addStat("withPrice",property.suburb(),1);
        costParamCount ++;
      }
      if (metrics.score) {
        addStat("withScore",property.suburb(),1); 
      }

      if (metrics.costs) {
        if (metrics.costs.strata) {
          addStat("withStrata",property.suburb(),1);
          costParamCount ++;
        }
        if (metrics.costs.council) {
          costParamCount ++;
          let v = parseFloat(metrics.costs.council.value)
          addMultiStat("council",property.suburb(),v);
        }
        if (metrics.costs.water) {
          costParamCount ++;
          let v = parseFloat(metrics.costs.water.value)
          addMultiStat("water",property.suburb(),v);
        }
      }
      if (metrics.size) {
        if (metrics.size.total) {
          addStat("withSize",property.suburb(),1); 
        }
      }
      if (costParamCount === 4) {
        addStat("withAllCosts",property.suburb(),1); 
      }
    }
    

  }
}

generateStats()
console.log(suburbStats);
console.log("\n");
console.log(overallStats);


fs.writeFile("./results/stats/overall.json", JSON.stringify(overallStats,null,2),function(err){});
fs.writeFile("./results/stats/suburbs.json", JSON.stringify(suburbStats,null,2),function(err){});

