let inspectionHelpers = require("../../algo/inspectionHelpers")
let hateoas = require("../routes/apiHAL")

const getAllInspections = function(req,res,next) {
  let suburb = req.params["suburb"]
  let result = inspectionHelpers.findAllInspections(suburb);
  for (let inspection of result) {
    hateoas(req.headers.host).link("inspection",inspection);
  }
  res.send(result);
}

module.exports = {
  getAllInspections
}