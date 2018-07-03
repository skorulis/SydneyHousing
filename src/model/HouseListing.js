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

  metricsFilename() {
    return this.filename().replace(".json","-metrics.json");
  }

  metricsJSON() {
    let metricsFilename = this.metricsFilename();
    if (fs.existsSync(metricsFilename)) {
      return JSON.parse(fs.readFileSync(metricsFilename, 'utf8'));  
    }
    return null;
  }

  isMissing() {
    return this.json.missing;
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

  imageURL() {
    let img = this.json.mainImage;
    return img.server + "/320x240" + img.uri;
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

  auctionDate() {
    if (!this.json.inspectionsAndAuctions) {
      return null;
    }
    let auction = this.json.inspectionsAndAuctions.filter(x => x.auction);
    if (auction.length > 0) {
      return auction[0].dateDisplay;
    }
  }

  nextInspection() {
    let inspection = this.json.nextInspectionTime;
    if (!inspection) {
      return null;
    }
    return inspection.dateDisplay + " " + inspection.startTimeDisplay;
  }

  type() {
    return this.json.propertyType;
  }

  isSold() {
    if (this.json.status) {
      return this.json.status.type === "sold";
    }
    return false;
  }

  roomDetails() {
    let beds = this.json.features.general.bedrooms;
    let baths = this.json.features.general.bathrooms;
    let cars = this.json.features.general.parkingSpaces;
    return "🛏" + beds + " 🚿" + baths + " 🚗" + cars;
  }

  isUnderOffer() {
    if (this.json.status) {
      return this.json.status.type === "under_offer";
    }
    return false; 
  }

  save() {
    let dir = "./results/properties/" + this.suburb();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    let filename = dir + "/" + this.id() + ".json"
    fs.writeFileSync(filename, JSON.stringify(this.json,null,2),function(err){
    });
  }

}

module.exports = HouseListing;
