let fs = require('fs');

function averagePriceMatches(matches,multiplier) {
  let total = 0;
  console.log(matches)
  for (let m of matches) {
    let mStripped = m.replace("$","").replace(",","").replace("k","");
    total += parseFloat(mStripped) * multiplier;
  }
  total = total / matches.length;
  return total;
}

class HouseListing {
  constructor(json) {
    this.json = json
  }

  url() {
    return this.json._links.short.href;
  }

  id() {
    return this.json._links.short.href.replace("http://www.realestate.com.au/","")
  }

  suburb() {
    return this.json.address.locality
  }

  latitude() {
    return this.json.address.location.latitude 
  }

  longitude() {
    return this.json.address.location.longitude 
  }

  filename() {
    return "./results/properties/" + this.suburb() + "/" + this.id() + ".json";
  }

  address() {
    return this.json.address.streetAddress + "," + this.suburb()
  }

  hasLocation() {
    return this.json.address.location;
  }

  description() {
    return this.json.description;
  }

  landSize() {
    return this.json.landSize;
  }

  priceEstimate() {
    let display = this.json.price.display;
    let regex = /\$(\d{3},\d{3})/ig;
    let matches = display.match(regex);

    let multiplier = 1;
    if (!matches || matches.length == 0) {
      regex = /\$\d{3,4}k/ig;
      matches = display.match(regex);
      multiplier = 1000;
      if (!matches || matches.length == 0) {
        return null;
      }      
    }

    return averagePriceMatches(matches,multiplier);
  }

  inspections() {
    let inspections = this.json.inspectionsAndAuctions;
    if (!inspections) {
      return []
    }
    return inspections.filter(x => !x.auction);
  }

  save() {
    let dir = "./results/properties/" + this.suburb();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    let filename = dir + "/" + this.id() + ".json"
    fs.writeFile(filename, JSON.stringify(this.json,null,2),function(err){
    });
  }

}

module.exports = HouseListing;
