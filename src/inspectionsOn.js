let fs = require('fs');

let helpers = require("./helperFunctions");
let HouseListing = require("./HouseListing");


let propFiles = helpers.allPropertyFiles();

for(let file of propFiles) {
  let propJson = JSON.parse(fs.readFileSync(file));
  let property = new HouseListing(propJson)
  let inspections = property.inspections();

  console.log(inspections.length)
}