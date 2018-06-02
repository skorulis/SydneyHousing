let propertyDetails = require("../../algo/getPropertyDetails");
let helpers = require("../../helperFunctions");
let fs = require('fs');
let hateoas = require("../routes/apiHAL")()
let HouseListing = require("../../model/HouseListing");

const getPropertyJson = function(file) {
  let propJson = JSON.parse(fs.readFileSync(file));
  let property = new HouseListing(propJson)

  let metricFile = file.replace(".json","-metrics.json");
  if (fs.existsSync(metricFile)) {
    let metrics = JSON.parse(fs.readFileSync(metricFile));
    let obj = metrics;
    obj.url = property.url();
    obj.isSold = property.isSold();
    obj["id"] = property.id();

    obj["image"] = property.imageURL();
    obj["address"] = property.address();
    obj["suburb"] = property.suburb();

    hateoas.link("property",obj)
    return obj;
  }
  return null;
}

const updateProperty = async function(req,res,next) {
  let pid = req.params["pid"]
  let suburb = req.params["suburb"];
  let result = await propertyDetails.evaluateProperty(pid)
  let file = helpers.getPropertyFilename(suburb,pid);
  let json = getPropertyJson(file);
  res.send(json);
}

const setPropertyFields = function(req,res,next) {
  let pid = req.params["pid"];
  let suburb = req.params["suburb"];

  let file = helpers.getPropertyFilename(suburb,pid);
  let metricFile = file.replace(".json","-metrics.json");
  if (fs.existsSync(metricFile)) {
    let metrics = JSON.parse(fs.readFileSync(metricFile));
    metrics.eliminated = req.body.eliminated;
    metrics.visited = req.body.visited;
    metrics.renovations = req.body.renovations;
    fs.writeFileSync(metricFile, JSON.stringify(metrics,null,2),function(err){});

    res.send(getPropertyJson(file));
  } else {
    res.send({error:"Could not find property"});
  }
}

const getPropertyDetails = function(req,res,next) {
  let pid = req.params["pid"];
  let suburb = req.params["suburb"];

  let file = helpers.getPropertyFilename(suburb,pid);
  res.send(getPropertyJson(file));
}

module.exports = {
  updateProperty,
  setPropertyFields,
  getPropertyJson,
  getPropertyDetails
};