let fs = require('fs');
let helpers = require("./helperFunctions");
let HouseListing = require("./model/HouseListing");

let propFiles = helpers.allPropertyFiles();

const findTopProperties = function() {
  let topProperties = [];

  for(let file of propFiles) {
    let propJson = JSON.parse(fs.readFileSync(file));
    let property = new HouseListing(propJson)

    let metricFile = file.replace(".json","-metrics.json");
    if (fs.existsSync(metricFile)) {
      let metrics = JSON.parse(fs.readFileSync(metricFile));
      if (metrics.score) {
        let virtual = metrics.costs.virtual;
        let obj = {price:metrics.estimatedPrice,score:metrics.score,suburb:property.suburb(),link:property.url()}
        obj.realCosts = metrics.costs.yearly
        obj.virtualCosts = virtual.travel + virtual.shopping
        obj.totalCosts = obj.realCosts + obj.virtualCosts
        topProperties.push(obj)
      }
    }

  }
  topProperties = topProperties.sort(function(a,b) {
    return a.score - b.score;
  })

  return topProperties
}

let top = findTopProperties();

console.log(top)