let fs = require('fs');
let helpers = require("./helperFunctions");
let suburbs = fs.readFileSync('./inputs/suburbs.txt', 'utf8').split("\n");
const cheerio = require('cheerio')

const extractAndSave = function(suburb) {
  let htmlFilename = helpers.getSuburbFilename(suburb);
  let htmlData = fs.readFileSync(htmlFilename, 'utf8')

  const $ = cheerio.load(htmlData);

  let housePriceList = $(".median-price-subsections.houses").find(".price.strong");

  let unitPriceList = $(".median-price-subsections.units").find(".price.strong");
  
  let postcodeContainer = $("#title").find(".subtitle")
  if (postcodeContainer.text().length == 0) {
    postcodeContainer = $(".suburb-box").find(".subtitle")
  }

  let json = {}
  json["house-buy"] = {};
  json["house-buy"]["median"] = housePriceList.eq(0).text();
  json["house-buy"]["2BR"] = housePriceList.eq(1).text();
  json["house-buy"]["3BR"] = housePriceList.eq(2).text();
  json["house-buy"]["4BR"] = housePriceList.eq(3).text();

  json["unit-buy"] = {};
  json["unit-buy"]["median"] = unitPriceList.eq(0).text();
  json["unit-buy"]["1BR"] = unitPriceList.eq(1).text();
  json["unit-buy"]["2BR"] = unitPriceList.eq(2).text();
  json["unit-buy"]["3BR"] = unitPriceList.eq(3).text();
  json["postcode"] = postcodeContainer.text().replace("New South Wales ","");

  fs.writeFile(helpers.getSuburbJSONFilename(suburb), JSON.stringify(json,null,2),function(err){

  });

}

for(let suburb of suburbs) {
  extractAndSave(suburb)
}