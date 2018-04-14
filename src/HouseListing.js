let fs = require('fs');

class HouseListing {
  constructor(json) {
    this.json = json
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

  description() {
    return this.json.description;
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
