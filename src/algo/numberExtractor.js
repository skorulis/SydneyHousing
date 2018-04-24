const buildNumberRegex = function(prefixes,optionals,suffixes) {
  let numberRegexString = "\\$?(\\d+\\.*\\d{0,2})"

  let prefixGroup = "(?:" + prefixes.join("|") + ")";


  let regexString = prefixGroup + ".{1,3}" + numberRegexString;
  let regex = new RegExp(regexString,"i")
  return regex;
}


const extractNumber = function(text,prefixes,optionals,suffixes) {
  let regex = buildNumberRegex(prefixes,optionals,suffixes);
  console.log(regex)
  let m1 = text.match(regex)
  if (m1) {
    return {value:m1[1],text:m1[0]}
  }
  return null;
}

const getStrata = function(text) {
  prefixes = ["Strata Levies"]
  optionals = [];
  suffixes = [];

  //\$(\d+\.*\d{0,2})"
  return extractNumber(text,prefixes,optionals,suffixes);
}

module.exports = {
  extractNumber,
  getStrata
};