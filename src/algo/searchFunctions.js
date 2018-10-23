let fetch = require("node-fetch")
let HouseListing = require("../model/HouseListing");
let suburbFunctions = require("./suburbFunctions");

const performSearch = async function(suburb,page) {
  let postcode = suburbFunctions.getPostcode(suburb);
  let searchLocation = suburb + ", NSW " + postcode

  page = (page || 1)

  let query = {channel:"buy",
    pageSize:"20",
    page:page.toString(),
    filters:
      {bedroomsRange:{maximum:"3",minimum:"2"},
      surroundingSuburbs:false,
      priceRange:{maximum:"900000",minimum:"600000"},
      minimumCars:1,
      sortType:"new-desc",
      localities:[{"searchLocation":searchLocation}]
    }
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

  let props = mappedResults.map(listing => listing.json)
  let next = null;
  if (Object.keys(json._links.next).length > 0) {
    next = "/search/" + suburb + "/" + (parseInt(page) + 1)
  }


  return {properties:props,next:next}

}


module.exports = {
  performSearch
};