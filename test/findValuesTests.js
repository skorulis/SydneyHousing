const chai = require('chai');
const should = chai.should();
const assert = chai.assert;

const numberExtractor = require("../src/algo/numberExtractor");


describe("Number extractors", function() {

  it("Extracts strata",function() {
      let s1 = numberExtractor.getStrata("Strata Levies: $638.25 per quarter approx.");
      s1.value.should.equal("638.25")
  });

});