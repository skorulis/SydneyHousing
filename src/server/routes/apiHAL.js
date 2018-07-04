var hateoasLib = require("hateoas")

module.exports = function(host) {
  let baseUrl = "http://" + host;
  let hateoas = hateoasLib({baseUrl: baseUrl});
  hateoas.registerLinkHandler("root", function() {
    return {
        "suburbs": "/suburbs",
        "allProperties":"/allProperties",
        "features":"/features",
        "inspections":"/inspections"
    };
  })  


  hateoas.registerLinkHandler("suburb", function(suburb) {
    let reLink = "https://www.realestate.com.au/buy/with-2-bedrooms-between-0-800000-in-" + suburb.name + "%2c+nsw+" + suburb.postcode + "%3b/list-1?includeSurrounding=false"

    return {
        "properties": "/" + suburb.name + "/properties",
        "realEstateSearch": reLink
    };
  })  

  hateoas.registerLinkHandler("property", function(property) {
    return {
        "update":"/property/" + property.suburb + "/" + property.id + "/update",
        "setFields":"/property/" + property.suburb + "/" + property.id + "/setFields"
    };
  })

  hateoas.registerLinkHandler("inspection", function(inspection) {
    return {
        "property":"/property/" + inspection.suburb + "/" + inspection.propertyId
    };
  })  

  return hateoas;
}