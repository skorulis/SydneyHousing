let searchFunctions = require("../../algo/searchFunctions");

const suburbSearch = async function(req,res,next) {
  let suburb = req.params["suburb"];
  console.log(req.params);
  let result = await searchFunctions.performSearch(suburb)
  res.send(result);
}

module.exports = {
  suburbSearch
}