let inspectionHelpers = require("../../algo/inspectionHelpers")

const getAllInspections = function(req,res,next) {
  let result = inspectionHelpers.findAllInspections();
  res.send(result);
}

module.exports = {
  getAllInspections
}