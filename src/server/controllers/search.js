let searchFunctions = require("../../algo/searchFunctions");

const suburbSearch = async function(req,res,nex) {
  let suburb = req.params["suburb"];
  let result = await searchFunctions.performSearch(suburb)
  res.send(result);
}

module.exports = {
  suburbSearch
}