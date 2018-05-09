let fs = require('fs');
let numberExtractor = require("../algo/numberExtractor")

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

  isAuction() {
    return this.json.authorityType == "Auction";
  }

  priceEstimate() {
    let display = this.json.price.display;
    return numberExtractor.getAveragedPrice(display)
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
