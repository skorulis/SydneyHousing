let fetch = require("node-fetch")
let HouseListing = require("../model/HouseListing");
let suburbFunctions = require("./suburbFunctions");
let searchParams = require("../../inputs/params.json").search

const passesFilter = function(listing) {
  if (listing.suburb() === "Canterbury") {
    if (listing.address().includes("Charles Street")) {
      return false;  
    }
  }

  return true;
}

const performSearch = async function(suburb,page) {
  let postcode = suburbFunctions.getPostcode(suburb);
  let searchLocation = suburb + ", NSW " + postcode

  page = (page || 1)

  searchParams.surroundingSuburbs = false;
  searchParams.sortType = "new-desc";
  searchParams.localities = [{"searchLocation":searchLocation}]

  console.log(searchParams)

  let query = {channel:"buy",
    pageSize:"20",
    page:page.toString(),
    filters:searchParams
  }

  console.log(query)

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

  let props = [];
  let filtered = [];
  for (let l of mappedResults) {
    if (passesFilter(l)) {
      props.push(l.json)
    } else {
      filtered.push(l.json)
    }
    
  }

  let next = null;
  if (Object.keys(json._links.next).length > 0) {
    next = "/search/" + suburb + "/" + (parseInt(page) + 1)
  }


  return {properties:props,next:next,filtered:filtered}

}


module.exports = {
  performSearch
};