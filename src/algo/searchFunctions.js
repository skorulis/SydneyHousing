let fetch = require("node-fetch")
let HouseListing = require("../model/HouseListing");

const performSearch = async function(suburb) {
  let postcode = "2193";
  let searchLocation = suburb + ", NSW " + postcode

  let query = {channel:"buy",
    filters:
      {bedroomsRange:{maximum:"3",minimum:"2"},
      surroundingSuburbs:false,
      localities:[{"searchLocation":searchLocation}],
      pageSize:"30"}
  }
  let url = "https://services.realestate.com.au/services/listings/search?query=";
  url = url + encodeURIComponent(JSON.stringify(query))

  console.log("START------- SEARCH")

  let response = await fetch(url);
  let json = await response.json()

  let results = json.tieredResults[0].results
  let mappedResults = results.map(r => new HouseListing(r))

  console.log("FINISH------- SEARCH")

  return mappedResults.map(listing => listing.json)
}


module.exports = {
  performSearch
};