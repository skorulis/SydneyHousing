var hateoasLib = require("hateoas")

module.exports = function(host) {
  let baseUrl = "http://" + host;
  let hateoas = hateoasLib({baseUrl: baseUrl});
  hateoas.registerLinkHandler("suburb", function(suburb) {
    return {
        "properties": "/" + suburb.name + "/properties",
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