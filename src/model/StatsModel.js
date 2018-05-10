class StatsModel {
  
  constructor(json) {
    this.json = json
  }

  avgCouncil() {
    if (!this.json.maxCouncil) {
      return null;
    }
    return (this.json.maxCouncil + this.json.minCouncil)/2;
  }

  avgWater() {
    if (!this.json.maxWater) {
      return null;
    }
    return (this.json.maxWater + this.json.minWater)/2;
  }
  

}

module.exports = StatsModel;
