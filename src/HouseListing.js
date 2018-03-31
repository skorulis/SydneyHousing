class HouseListing {
  constructor(json) {
    this.json = json
  }

  id() {
    return this.json._links.short.href.replace("http://www.realestate.com.au/","")
  }

}

module.exports = HouseListing;
