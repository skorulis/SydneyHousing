let fetch = require("node-fetch")
let sleep = require('sleep');
let fs = require('fs');
let suburbs = fs.readFileSync('./inputs/suburbs.txt', 'utf8').split("\n");

let baseURL = "https://maps.googleapis.com/maps/api/directions/json";

const getDirectionsFilename = function(from,to,mode) {
  return `./results/${mode}/${from}-${to}.json`;
}

const getSuburbFilename = function(suburb) {
  return `./results/suburbs/${suburb}.html`;
}

const getDirections = async function(from,to,mode) {
  let arrival = new Date('09:00 2018.03.29').getTime() / 1000;
  let url = `${baseURL}?origin=${from}&destination=${to}&mode=${mode}&key=AIzaSyBSBzblLqx5_i0y-WjijmeDDW-NKuFnSDc&arrival_time=${arrival}`;

  console.log(url);

  let response = await fetch(url);
  let json = await response.json()

  delete json["routes"][0]["legs"][0]["steps"]
  delete json["routes"][0]["overview_polyline"]

  let filename = getDirectionsFilename(from,to,mode);

  fs.writeFile(filename, JSON.stringify(json,null,2),function(err){

  });

  return json;
}

const getSuburbInfo = async function(suburb) {
  let url = `https://www.realestate.com.au/neighbourhoods/${suburb}-nsw`

  console.log(url);

  let response = await fetch(url);
  let text = await response.text()

  let filename = getSuburbFilename(suburb);

  fs.writeFile(filename, text,function(err){

  });

  return text
}

const getAllDirections = async function(to,mode) {
  for(let s of suburbs) {
    let suburb = s + ",Sydney";


    let filename = getDirectionsFilename(suburb,to,mode);
    if (!fs.existsSync(filename)) {
      let x = await getDirections(suburb,to,mode);
      sleep.sleep(1);
    }
    let suburbFilename = getSuburbFilename(s);
    if (!fs.existsSync(suburbFilename)) {
      let x = await getSuburbInfo(s)
      sleep.sleep(1);
    }

  }
}



getAllDirections("Sydney Central Station","transit");


