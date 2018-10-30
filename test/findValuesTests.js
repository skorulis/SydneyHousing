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

      let s5 = numberExtractor.getStrata("Council: $279/q; Strata: $579/q; Water: $177/q; Approx. area: 77sqm");
      s5.value.should.equal("579")    

      let s6 = numberExtractor.getStrata("Strata Approx $825/q, Council fee Approx $253/q and water fee Approx $177/q"); 
      s6.value.should.equal("825")            

      let s7 = numberExtractor.getStrata("Outgoings: Strata Levies $744.00 p/q, Council Rates $274.00 p/q, Water Rates $178.00 p/q");
      s7.value.should.equal("744.00")

      let s8 = numberExtractor.getStrata("STRATA | $976 per quarter");
      s8.value.should.equal("976")

  });

  it("Extracts council rates",function() {
      let s1 = numberExtractor.getCouncilRates("Council Rates: $284.05 per quarter approx");
      s1.value.should.equal("284.05")
      let s2 = numberExtractor.getCouncilRates("Strata approx. $1048p/q , Council approx. $302 p/q.");
      s2.value.should.equal("302")

      let s3 = numberExtractor.getCouncilRates("Strata Approx $825/q, Council fee Approx $253/q and water fee Approx $177/q"); 
      s3.value.should.equal("253")

  });

  it("Extracts water rates",function() {
      let s1 = numberExtractor.getWaterRates("Water Rates:         $177.85 per quarter approx");
      s1.value.should.equal("177.85")
  });

  it("Extracts building size",function() {
    let s1 = numberExtractor.getBuildingSize("Internal + Balconly = approx. 69 sqm, car space + storage = approx. 22 sqm, Total area approx. 91 sqm");
    s1.value.should.equal("69")
  });

  it("Extracts total area",function() {
    let s1 = numberExtractor.getTotalSize("Total area: 181sqm approx.");
    s1.value.should.equal("181")

    let s2 = numberExtractor.getTotalSize("Total area = 113sqm");
    s2.value.should.equal("113")
  });

  it("Extracts internal size",function() {
    let s1 = numberExtractor.getInternalSize("Internal area: 50 sqm. (approx.)");
    s1.value.should.equal("50")
  })

  it("Extracts street address",function() {
    let s2 = numberExtractor.streetAddress("3/1 Cooks Avenue,Canterbury")
    s2.should.equal("1 Cooks Avenue,Canterbury")

    let s1 = numberExtractor.streetAddress("Unit 205/8 Broughton St,Canterbury")
    s1.should.equal("8 Broughton St,Canterbury")

    let s3 = numberExtractor.streetAddress("9/237-239 Canterbury Road,Canterbury")
    s3.should.equal("237-239 Canterbury Road,Canterbury")

    let s4 = numberExtractor.streetAddress("405/2A Cooks Avenue,Canterbury")
    s4.should.equal("2A Cooks Avenue,Canterbury")

    let s5 = numberExtractor.streetAddress("2A Cooks Avenue,Canterbury")
    s5.should.equal("2A Cooks Avenue,Canterbury")

    let s6 = numberExtractor.streetAddress("51 Cressy Street,Canterbury")
    s6.should.equal("51 Cressy Street,Canterbury")

    let s7 = numberExtractor.streetAddress("32-34 Loftus St,Campsie")
    s7.should.equal("32-34 Loftus St,Campsie")

    let s8 = numberExtractor.streetAddress("D510, 2 Mackinder Street,Campsie")
    s8.should.equal("2 Mackinder Street,Campsie")

    let s9 = numberExtractor.streetAddress("B310/1A Coulson Street,Erskineville")
    s9.should.equal("1A Coulson Street,Erskineville")

    let s10 = numberExtractor.streetAddress("A608/33 Bridge Street,Erskineville")
    s10.should.equal("33 Bridge Street,Erskineville")

    
    
    

    



  })

});