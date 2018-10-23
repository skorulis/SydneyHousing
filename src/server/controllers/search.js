let searchFunctions = require("../../algo/searchFunctions");

const suburbSearch = async function(req,res,next) {
  let suburb = req.params["suburb"];
  let page = req.params["page"];
  console.log(req.params);
  let result = await searchFunctions.performSearch(suburb,page)
  res.send(result);
}

module.exports = {
  suburbSearch
}