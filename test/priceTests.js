const chai = require('chai');
const should = chai.should();
const assert = chai.assert;

const numberExtractor = require("../src/algo/numberExtractor");


describe("Extracts price information", function() {

	it("Extracts prices",function() {
		let m1 = numberExtractor.getPriceMatches("$500k")
		m1[0].should.equal(500000)

		let m2 = numberExtractor.getPriceMatches("$500k - $600k")
		m2[0].should.equal(500000)
		m2[1].should.equal(600000)

		let m3 = numberExtractor.getPriceMatches("$400,000")
		m3[0].should.equal(400000)

	    let s1 = numberExtractor.getAveragedPrice("$550,000")
	    s1.should.equal(550000)

	    let s2 = numberExtractor.getAveragedPrice("$1,127,000")
	    s2.should.equal(1127000)

	    let s3 = numberExtractor.getAveragedPrice("$800,000 - $900,000")
	    s3.should.equal(850000)

	    let s4 = numberExtractor.getAveragedPrice("$800k - $900k")
	    s4.should.equal(850000)
  	})

  	it("Extracts price object",function() {
  		let p1 = numberExtractor.getPriceValues("$550,000")
  		p1.estimate.should.equal(550000)
  		p1.low.should.equal(550000)
  		p1.high.should.equal(550000)

  		let p2 = numberExtractor.getPriceValues("$550,000 - $650,000")
  		p2.estimate.should.equal(600000)
  		p2.low.should.equal(550000)
  		p2.high.should.equal(650000)
  	});

  	it("Merges price objects",function() {
  		let p1 = numberExtractor.getPriceValues("$400,000 - $450,000")
  		let p2 = numberExtractor.getPriceValues("$430,000")

  		let merged = numberExtractor.mergePriceValues(p1,p2)
  		merged.low.should.equal(400000)
  		merged.high.should.equal(450000)
  		merged.estimate.should.equal(430000)

  		let p3 = {estimate:200000}
  		let p4 = {estimate:200000,high:300000,low:100000}

  		let merged2 = numberExtractor.mergePriceValues(p3,p4)
  		merged2.low.should.equal(100000)
  		merged2.high.should.equal(300000)
  		merged2.estimate.should.equal(200000)

  	})

});