let StatsModel = require("./StatsModel")

class StatsContainer {
  constructor(allStatsJson,suburbStatsJson) {
    this.allStats = new StatsModel(allStatsJson)
    this.suburbMap = {};
    for (let x in suburbStatsJson) {
      this.suburbMap[x] = new StatsModel(suburbStatsJson[x])
    }
  }

  getSuburbStats(suburb) {
    return this.suburbMap[suburb];
  }

  avgWater(suburb) {
    let water = null;
    let subModel = this.getSuburbStats(suburb) 
    if (subModel) {
      water = this.getSuburbStats(suburb).avgWater();  
    }
    
    water = water || this.allStats.avgWater()
    return water
  }


  avgCouncil(suburb) {
    let council = null;
    let subModel = this.getSuburbStats(suburb) 
    if (subModel) {
      council = this.getSuburbStats(suburb).avgCouncil();  
    }
    
    council = council || this.allStats.avgCouncil()
    return council
  }

  avgCouncilObj(suburb) {
    let value = this.avgCouncil(suburb)
    if (!value) {
      return null;
    }
    return {"value":value.toFixed(0),isEstimate:true}
  }

  avgWaterObj(suburb) {
    let value = this.avgWater(suburb)
    if (!value) {
      return null;
    }
    return {"value":value.toFixed(0),isEstimate:true}
  }
  

}

module.exports = StatsContainer;
