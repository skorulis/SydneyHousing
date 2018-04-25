const buildNumberRegex = function(prefixes,optionals,suffixes) {
  let numberRegexString = ":?\\s{0,10}?\\$?(\\d,?\\d{0,4}\\.?\\d{0,2})\\s?"

  let prefixGroup = "(?:" + prefixes.join("|") + ")";
  let suffixGroup = "(?:" + suffixes.join("|") + ")";
  let optionalsGroup = optionals.map((x) => {return "(?:" + x + ")?"}).join("\\s?")

  let regexString = prefixGroup + "\\s?" + optionalsGroup + "\\s?" + numberRegexString + suffixGroup;
  let regex = new RegExp(regexString,"i")
  return regex;
}


const extractNumber = function(text,prefixes,optionals,suffixes) {
  let regex = buildNumberRegex(prefixes,optionals,suffixes);
  //console.log(regex)
  let m1 = text.match(regex)
  if (m1) {
    return {value:m1[1].replace(",",""),text:m1[0]}
  }
  return null;
}

const getStrata = function(text) {
  prefixes = ["Strata Levies","Levies","Strata"]
  optionals = ["-","rates","rate",":","approx\\.","approximately"];
  suffixes = ["per quarter","pq","p/q","/q"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getCouncilRates = function(text) {
  prefixes = ["Council Rates","Council"]
  optionals = ["-","rates","rate",":","approx\\.","approximately"];
  suffixes = ["per quarter","pq","p/q","/q"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getWaterRates = function(text) {
  prefixes = ["Water"]
  optionals = ["-","rates","rate",":","approx\\.","approximately"];
  suffixes = ["per quarter","pq","p/q","/q"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getBuildingSize = function(text) {
  prefixes = ["Internal \\+ Balconly = approx\\."]
  optionals = [];
  suffixes = ["sqm","m²"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getInternalSize = function(text) {
  prefixes = ["Internal Size"]
  optionals = [":"];
  suffixes = ["sqm","m²","m2"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getTotalSize = function(text) {
  prefixes = ["Total area","Total size"]
  optionals = [":"];
  suffixes = ["sqm","m²","m2"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

module.exports = {
  extractNumber,
  getStrata,
  getCouncilRates,
  getWaterRates,
  getBuildingSize,
  getTotalSize,
  getInternalSize
};