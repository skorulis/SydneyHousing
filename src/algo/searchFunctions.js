let fetch = require("node-fetch")
let HouseListing = require("../model/HouseListing");
let suburbFunctions = require("./suburbFunctions");

const performSearch = async function(suburb) {
  let postcode = suburbFunctions.getPostcode(suburb);
  let searchLocation = suburb + ", NSW " + postcode

  let query = {channel:"buy",
    filters:
      {bedroomsRange:{maximum:"3",minimum:"2"},
      surroundingSuburbs:false,
      priceRange:{maximum:"900000",minimum:"600000"},
      minimumCars:1,
      sortType:"new-desc",
      localities:[{"searchLocation":searchLocation}],
      pageSize:"50"}
  }
  let url = "https://services.realestate.com.au/services/listings/search?query=";
  url = url + encodeURIComponent(JSON.stringify(query))

  console.log("START------- SEARCH")
  console.log(url);

  let response = await fetch(url);
  let json = await response.json()

  let results = json.tieredResults[0].results
  results = results.filter(x => !x.childListings)
  let mappedResults = results.map(r => new HouseListing(r))
  mappedResults = mappedResults.filter(x => {
    let existingMetrics = x.metricsJSON()
    return existingMetrics == null;
  })

  console.log("FINISH------- SEARCH")

  return mappedResults.map(listing => listing.json)
}


module.exports = {
  performSearch
};