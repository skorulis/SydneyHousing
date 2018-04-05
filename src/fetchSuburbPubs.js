let fs = require('fs');
let helpers = require("./helperFunctions");
let FourSquareVenue = require("./model/FourSquareVenue");

let focusSuburbs = fs.readFileSync('./inputs/focus-suburbs.txt', 'utf8').split("\n");

let suburbs = JSON.parse(fs.readFileSync('./inputs/all-suburbs.json', 'utf8'))
let fetch = require("node-fetch")

let foursquareKey = process.argv[2]
let pubMap = {};

const findSuburb = function(name) {
  for (let s of suburbs) {
    if (s.name == name) {
      return s;
    }
  }
  return null;
}

const findNearbyPubs = async function(suburb) {
  let categoryId = "4d4b7105d754a06376d81259";
  let version = "20180405"
  let ll = suburb.lat + "," + suburb.lng;

  let url = `https://api.foursquare.com/v2/venues/search?oauth_token=${foursquareKey}&categoryId=${categoryId}&ll=${ll}&intent=browse&limit=50&radius=2000&v=${version}`;
  console.log(url)
  let response = await fetch(url);
  let json = await response.json()

  let venues = json.response.venues.map((x) => {return new FourSquareVenue(x)})

  console.log("Got " + venues.length + " pubs")
  return venues
}

const getAllPubs = async function() {
  for (let sub of focusSuburbs) {
    let subDetails = findSuburb(sub)
    let pubs = await findNearbyPubs(subDetails);
    for (let p of pubs) {
      pubMap[p.id()] = p;
    }
  }

  let pubArray = [];
  for (let key in pubMap) {
    pubArray.push(pubMap[key].json)
  }

  fs.writeFile("./inputs/pubs.json", JSON.stringify(pubArray,null,2),function(err){});
}

getAllPubs()


