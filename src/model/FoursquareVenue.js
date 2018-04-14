class FourSquareVenue {
  constructor(json) {
    this.json = json
  }

  id() {
    return this.json.id
  }

  address() {
    return this.json.location.address;
  }

}

module.exports = FourSquareVenue;