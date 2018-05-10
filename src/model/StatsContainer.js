let StatsModel = require("./StatsModel")

class StatsContainer {
  constructor(allStatsJson,suburbStatsJson) {
    this.allStats = new StatsModel(allStatsJson)
  }

  avgCouncil() {
    if (!this.json.maxCouncil) {
      return null;
    }
    return (this.json.maxCouncil + this.json.minCouncil)/2;
  }

  avgCouncilObj() {
    let value = this.avgCouncil()
    if (!value) {
      return null;
    }
    return {"value":value.toFixed(2),"text":"avg from " + this.json.withCouncil}
  }
  

}

module.exports = StatsModel;
