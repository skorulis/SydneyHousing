let inspectionHelpers = require("../../algo/inspectionHelpers")
let hateoas = require("../routes/apiHAL")
let helpers = require("../../helperFunctions")

const getAllInspections = function(req,res,next) {
  let suburb = req.params["suburb"]
  let date = helpers.nextSaturday(new Date());
  let result = inspectionHelpers.findAllInspections(suburb,date);
  for (let inspection of result) {
    hateoas(req.headers.host).link("inspection",inspection);
  }
  res.send({date:date,inspections:result});
}

module.exports = {
  getAllInspections
}