let fs = require('fs');
let fetch = require("node-fetch")
let helpers = require("../helperFunctions");
let HouseListing = require("./HouseListing");

let suburbs = fs.readFileSync('./inputs/focus-suburbs.txt', 'utf8').split("\n");

const getProperties = async function(suburb) {
  let query = {channel:"buy",
    filters:
      {bedroomsRange:{maximum:"3",minimum:"2"},
      surroundingSuburbs:true,
      localities:[{locality:suburb,subdivision:"NSW"}],
      pageSize:"30"}
  }
  let url = "https://services.realestate.com.au/services/listings/search?query=";
  url = url + JSON.stringify(query)

  console.log(url)

  let response = await fetch(url);
  let json = await response.json()

  let all = [];
  for (let t of json.tieredResults) {
    for (let p of t.results) {
      let house = new HouseListing(p)
      all.push(house);
    }
  }

  return all
}

const saveProperty = function(listing) {
  let dir = "./results/properties/" + listing.suburb();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  let filename = dir + "/" + listing.id() + ".json"
  fs.writeFile(filename, JSON.stringify(listing.json,null,2),function(err){
  });
}

const getAllProperties = async function() {
  for (let s of suburbs) {
    let props = await getProperties(s);
    for (let p of props) {
      saveProperty(p)
    }
    break;
  }
}




for (let s of suburbs) {
  let dir = "./results/properties/" + s;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

getAllProperties()
