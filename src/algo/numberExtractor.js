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
  prefixes = ["Strata Levies","Levies","Strata","Strata levy"]
  optionals = ["-","rates","rate",":","approx\\.","approximately","approx","\\|"];
  suffixes = ["per quarter","pq","p/q","/q","¼","p\\.q"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getCouncilRates = function(text) {
  prefixes = ["Council Rates","Council","Council fee"]
  optionals = ["-","rates","rate",":","approx\\.","approximately","approx"];
  suffixes = ["per quarter","pq","p/q","/q","$","¼","p\\.q"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getWaterRates = function(text) {
  prefixes = ["Water","water fee"]
  optionals = ["-","rates","rate",":","approx\\.","approximately","approx"];
  suffixes = ["per quarter","pq","p/q","/q","¼","p\\.q"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getBuildingSize = function(text) {
  prefixes = ["Internal \\+ Balconly = approx\\."]
  optionals = [];
  suffixes = ["sqm","m²"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getInternalSize = function(text) {
  prefixes = ["Internal Size","Internal area"]
  optionals = [":"];
  suffixes = ["sqm","m²","m2"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getTotalSize = function(text) {
  prefixes = ["Total area","Total size","total","Total area size","Total living area","Apartment size"]
  optionals = [":","="];
  suffixes = ["sqm","m²","m2"];

  return extractNumber(text,prefixes,optionals,suffixes);
}

const getPriceMatches = function(text) {
  let regex = /\$((?:\d,)?\d{3},?\d{3})/ig;
  let matches = text.match(regex);

  let multiplier = 1;
  if (!matches || matches.length == 0) {
    regex = /\$\d{3,4}k/ig;
    matches = text.match(regex);
    multiplier = 1000;
    if (!matches || matches.length == 0) {
      return [];
    }      
  }

  return matches.map((m) => {
    let mStripped = m.replace(new RegExp(",", 'g'), "");
    mStripped = mStripped.replace("$","").replace("k","");
    return parseFloat(mStripped) * multiplier;
  })

}

const getAveragedPrice = function(text) {
  let matches = getPriceMatches(text)
  if (matches.length == 0) {
    return null;
  }
  return matches.reduce((a, b) => a + b, 0) / matches.length;
}

function averagePriceMatches(matches,multiplier) {
  let total = 0;
  for (let m of matches) {
    let mStripped = m.replace(new RegExp(",", 'g'), "");
    mStripped = mStripped.replace("$","").replace("k","");
    total += parseFloat(mStripped) * multiplier;
  }
  total = total / matches.length;
  return total;
}

function getPriceValues(display) {
  let matches = getPriceMatches(display)
  if (matches.length == 0) {
    return {}
  }
  let obj = {};
  obj.estimate = matches.reduce((a, b) => a + b, 0) / matches.length;
  obj.low = Math.min.apply(null, matches);
  obj.high = Math.max.apply(null, matches);
  return obj
}

function mergePriceValues(old,newObj) {
  let merged = {};
  merged.estimate = newObj.estimate || old.estimate
  if (!old.low || !newObj.low) {
    merged.low = newObj.low || old.low
  } else {
    merged.low = Math.min(old.low,newObj.low)  
  }

  if (!old.high || !newObj.high) {
    merged.high = newObj.high || old.high
  } else {
    merged.high = Math.max(old.high,newObj.high)  
  }

  merged.sold = newObj.sold || old.sale

  return merged
}

function streetAddress(fullAddress) {
  let regex = "^(Unit |[A-Z]){0,1}\\d{1,5}(\\/|, )";
  let matches = fullAddress.match(regex);
  if (matches && matches.length > 0) {
    fullAddress = fullAddress.replace(matches[0],"");
  }
  return fullAddress;
}

module.exports = {
  extractNumber,
  getStrata,
  getCouncilRates,
  getWaterRates,
  getBuildingSize,
  getTotalSize,
  getInternalSize,
  getAveragedPrice,
  streetAddress,
  getPriceValues,
  getPriceMatches,
  mergePriceValues
};