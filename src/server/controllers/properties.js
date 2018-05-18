let propertyDetails = require("../../algo/getPropertyDetails");


const updateProperty = async function(req,res,next) {
  let pid = req.params["pid"]
  console.log("Update property" + pid)
  let result = await propertyDetails.evaluateProperty(pid)
  res.send(result);
}

module.exports = {
  updateProperty
};