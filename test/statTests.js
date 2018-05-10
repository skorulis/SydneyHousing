const chai = require('chai');
const should = chai.should();
const assert = chai.assert;

const StatsContainer = require("../src/model/StatsContainer")

let allStats = { count: 385,
  withPrice: 161,
  withStrata: 93,
  withScore: 10,
  withCouncil: 66,
  maxCouncil: 338.95,
  minCouncil: 180,
  withWater: 65,
  maxWater: 263,
  minWater: 168,
  withSize: 38,
  withAllCosts: 40,
  auction: 91 };

let suburbStats =  {Waverton: { count: 1, auction: 1 },
  'Wentworth Point': { count: 6 },
  'West Ryde': { count: 5, withPrice: 3, withSize: 2 },
  Westmead: { count: 2 },
  'Wiley Park': { count: 1, auction: 1 },
  Willoughby: 
   { count: 1,
     withPrice: 1,
     withStrata: 1,
     withCouncil: 1,
     maxCouncil: 336,
     minCouncil: 336,
     withWater: 1,
     maxWater: 172,
     minWater: 172,
     withAllCosts: 1 },
  'Wolli Creek': 
   { count: 1,
     auction: 1,
     withStrata: 1,
     withCouncil: 1,
     maxCouncil: 326,
     minCouncil: 326,
     withWater: 1,
     maxWater: 172,
     minWater: 172 },
  Wollstonecraft: { count: 1, withPrice: 1, withStrata: 1 },
  Woollahra: { count: 1, withPrice: 1 },
  Zetland: { count: 1, withPrice: 1 } 
}

describe("Finds stats",function() {
  it("Buils container",function() {
    let container = new StatsContainer(allStats,suburbStats);
    let sub = container.getSuburbStats("Zetland");
    assert(sub.avgCouncil()==null);
    sub = container.getSuburbStats("Willoughby");
    sub.avgCouncil().should.equal(336)
    container.avgCouncil("Willoughby").should.equal(336)
    container.avgCouncil("Ryde").should.equal(259.475)

    let water = container.avgWaterObj("Wolli Creek")
    water.value.should.equal("172")
    water.isEstimate.should.equal(true)

  });
});