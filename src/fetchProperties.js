let fs = require('fs');
let fetch = require("node-fetch")
let helpers = require("../helperFunctions");
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

  let response = await fetch(url);
  let json = await response.json()

  return json
}

const getAllProperties = async function() {
  for (let s of suburbs) {
    let props = await getProperties(s);
    console.log(props)
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
