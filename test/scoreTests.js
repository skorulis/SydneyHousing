const chai = require('chai');
const should = chai.should();
const assert = chai.assert;

const scoreFunctions = require("../src/algo/scoreFunctions");

describe("Score tests", function() {

  it("Calculates land size weighting",function() {
      scoreFunctions.landSizeWeighting(50).should.equal(1);
      scoreFunctions.landSizeWeighting(100).should.equal(1);
      scoreFunctions.landSizeWeighting(200).should.equal(0.75);
  });

  it("Calculates land score divider",function() {
      scoreFunctions.landScoreDivider(50).should.equal(50);
      scoreFunctions.landScoreDivider(100).should.equal(100);
      scoreFunctions.landScoreDivider(200).should.equal(150);
      scoreFunctions.landScoreDivider(300).should.equal(150);
  });

  it("Calculated metric scores",function() {
    let metrics = {costs:{},size:{}};
    metrics.costs.virtual = {};
    metrics.costs.yearly = 10000;
    metrics.costs.virtual.travel = 2000;
    metrics.costs.virtual.shopping = 3000;

    let score = scoreFunctions.calculateSimpleScore(metrics);
    score.should.equal(-150)

    score = scoreFunctions.calculateSizeScore(metrics);
    assert(score == null);

    metrics.size.total = {value:100};
    score = scoreFunctions.calculateSizeScore(metrics);
    score.should.equal(-150)

    metrics.size.total = {value:200};
    score = scoreFunctions.calculateSizeScore(metrics);
    score.should.equal(-100)

  })

});