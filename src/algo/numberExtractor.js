const buildNumberRegex = function(prefixes,optionals,suffixes) {
  let numberRegexString = ":?\\s{1,10}?\\$?(\\d,?\\d{0,4}\\.?\\d{0,2})\\s?"

  let prefixGroup = "(?:" + prefixes.join("|") + ")";
  let suffixGroup = "(?:" + suffixes.join("|") + ")";
  let optionalsGroup = optionals.map((x) => {return "(?:" + x + ")?"}).join("\\s?")

  let regexString = prefixGroup + "\\s?" + optionalsGroup + "\\s?" + numberRegexString + suffixGroup;
  let regex = new RegExp(regexString,"i")
  return regex;
}


const extractNumber = function(text,prefixes,optionals,suffixes) {
  let regex = buildNumberRegex(prefixes,optionals,suffixes);
  console.log(regex)
  let m1 = text.match(regex)
  if (m1) {
    return {value:m1[1].replace(",",""),text:m1[0]}
  }
  return null;
}

const getStrata = function(text) {
  prefixes = ["Strata Levies","Levies","Strata"]
  optionals = ["rates",":","approx\\.","approximately"];
  suffixes = ["per quarter","pq","p/q"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getCouncilRates = function(text) {
  prefixes = ["Council Rates","Council"]
  optionals = ["rates",":","approx\\.","approximately"];
  suffixes = ["per quarter","pq","p/q"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getWaterRates = function(text) {
  prefixes = ["Water Rates"]
  optionals = ["rates",":","approx\\.","approximately"];
  suffixes = ["per quarter","pq","p/q"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getBuildingSize = function(text) {
  prefixes = ["Internal \\+ Balconly = approx\\."]
  optionals = [];
  suffixes = ["sqm"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

module.exports = {
  extractNumber,
  getStrata,
  getCouncilRates,
  getWaterRates,
  getBuildingSize
};