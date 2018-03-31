let fs = require('fs');
const cheerio = require('cheerio')
let fetch = require("node-fetch")
let gpsUtil = require("gps-util")

let stations = JSON.parse(fs.readFileSync("./inputs/stations.json", 'utf8'));

const getAllStations = async function() {
  for (let s of stations) {
    
    let url = "https://en.wikipedia.org/wiki/" + s.name.replace(/ /g,"_")

    console.log(url)

    let response = await fetch(url);
    let htmlData = await response.text();

    const $ = cheerio.load(htmlData);
    let container = $(".geo-dms").first()

    let lat = container.children(".latitude").text()
    let lng = container.children(".longitude").text()

    let latComp = lat.replace("′","°").replace("\″","").replace("S","").split("°")
    let lngComp = lng.replace("′","°").replace("\″","").replace("E","").split("°")

    s["lat"] = lat;
    s["lng"] = lng;
    s["latDec"] = -gpsUtil.toDD(parseInt(latComp[0]),parseInt(latComp[1]),parseInt(latComp[2]))
    s["lngDec"] = gpsUtil.toDD(parseInt(lngComp[0]),parseInt(lngComp[1]),parseInt(lngComp[2]))

  } 

  fs.writeFile("./inputs/stations.json", JSON.stringify(stations,null,2),function(err){
  });
}

getAllStations()