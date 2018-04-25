const chai = require('chai');
const should = chai.should();
const assert = chai.assert;

const numberExtractor = require("../src/algo/numberExtractor");


describe("Number extractors", function() {

  it("Extracts strata",function() {
      let s1 = numberExtractor.getStrata("Strata Levies: $638.25 per quarter approx.");
      s1.value.should.equal("638.25")
      let s2 = numberExtractor.getStrata("Levies: $1,986pq, potential rent $700/wk");
      s2.value.should.equal("1986")
      let s3 = numberExtractor.getStrata("Strata approx. $1048p/q , Council approx. $302 p/q.");
      s3.value.should.equal("1048")
      let s4 = numberExtractor.getStrata("Strata rates: approximately $1,529.00 per quarter");
      s4.value.should.equal("1529.00")
  });

  it("Extracts council rates",function() {
      let s1 = numberExtractor.getCouncilRates("Council Rates: $284.05 per quarter approx");
      s1.value.should.equal("284.05")
      let s2 = numberExtractor.getCouncilRates("Strata approx. $1048p/q , Council approx. $302 p/q.");
      s2.value.should.equal("302")


  });

  it("Extracts water rates",function() {
      let s1 = numberExtractor.getWaterRates("Water Rates:         $177.85 per quarter approx");
      s1.value.should.equal("177.85")
  });

  it("Extracts building size",function() {
    let s1 = numberExtractor.getBuildingSize("Internal + Balconly = approx. 69 sqm, car space + storage = approx. 22 sqm, Total area approx. 91 sqm");
    s1.value.should.equal("69")
  });

});