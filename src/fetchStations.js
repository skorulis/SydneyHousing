let fs = require('fs');
const cheerio = require('cheerio')
let fetch = require("node-fetch")

let stations = JSON.parse(fs.readFileSync("./inputs/stations.json", 'utf8'));

const getAllStations = async function() {
  for (let s of stations) {
    if (s.lat) {
      continue;
    }
    let url = "https://en.wikipedia.org/wiki/" + s.name.replace(/ /g,"_")

    console.log(url)

    let response = await fetch(url);
    let htmlData = await response.text();

    const $ = cheerio.load(htmlData);
    let container = $(".geo-dms").first()

    let lat = container.children(".latitude").text()
    let lng = container.children(".latitude").text()
    s["lat"] = lat;
    s["lng"] = lng;
  } 

  fs.writeFile("./inputs/stations.json", JSON.stringify(stations,null,2),function(err){
  });
}

getAllStations()