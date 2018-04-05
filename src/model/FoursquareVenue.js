class FourSquareVenue {
  constructor(json) {
    this.json = json
  }

  id() {
    return this.json.id
  }

}

module.exports = FourSquareVenue;