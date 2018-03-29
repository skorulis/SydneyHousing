let fs = require('fs');
let helpers = require("./helperFunctions");
let suburbs = fs.readFileSync('./inputs/suburbs.txt', 'utf8').split("\n");


const generateStats = function(suburb) {
  let obj = {name:suburb};

  let drivingFileName = helpers.getDirectionsFilename(suburb,"Sydney Central Station","driving")
  let drivingJson = JSON.parse(fs.readFileSync(drivingFileName, 'utf8'));
  let drivingData = drivingJson["routes"][0]["legs"][0]
  obj["drivingDistance"] = drivingData["distance"]["value"];
  obj["drivingDuration"] = drivingData["duration"]["value"];

  return obj
}

const generateAllStats = function() {
  let allStats = [];

  for(let suburb of suburbs) {
    allStats.push(generateStats(suburb))
  }

  return allStats;

}

const sortResults = function(stats) {
  return stats.sort(function(a,b) {
    return a.drivingDuration - b.drivingDuration;
  })
}


let stats = generateAllStats();
stats = sortResults(stats);




fs.writeFile("./results/stats/stats.json", JSON.stringify(stats,null,2),function(err){

});

