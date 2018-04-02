let fetch = require("node-fetch")
let sleep = require('sleep');
let fs = require('fs');
let suburbs = fs.readFileSync('./inputs/suburbs.txt', 'utf8').split("\n");
let helpers = require("./helperFunctions");
let params = JSON.parse(fs.readFileSync("./inputs/params.json", 'utf8'));


const getDirections = async function(from,to,mode) {
  let json = helpers.getDirections(from,to,mode);

  let filename = helpers.getDirectionsFilename(from,to,mode);

  fs.writeFile(filename, JSON.stringify(json,null,2),function(err){

  });

  return json;
}

const getSuburbInfo = async function(suburb) {
  let url = `https://www.realestate.com.au/neighbourhoods/${suburb}-nsw`

  console.log(url);

  let response = await fetch(url);
  let text = await response.text()

  let filename = helpers.getSuburbFilename(suburb);

  fs.writeFile(filename, text,function(err){

  });

  return text
}

const getAllDirections = async function(to,mode) {
  for(let suburb of suburbs) {

    let filename = helpers.getDirectionsFilename(suburb,to,mode);
    if (!fs.existsSync(filename)) {
      let x = await getDirections(suburb,to,mode);
      sleep.sleep(1);
    }
    let suburbFilename = helpers.getSuburbFilename(suburb);
    if (!fs.existsSync(suburbFilename)) {
      let x = await getSuburbInfo(suburb)
      sleep.sleep(1);
    }

  }
}

for (let loc of params.locations) {
  getAllDirections(loc.name,loc.mode);  
}





