var hateoasLib = require("hateoas")

module.exports = function() {
  let hateoas = hateoasLib({baseUrl: "http://localhost:7900"});
  hateoas.registerLinkHandler("suburb", function(suburb) {
    return {
        "properties": "/" + suburb.name + "/properties"
    };
  })  

  hateoas.registerLinkHandler("property", function(property) {
    return {
        "update":"/property/update/" + property.id
    };
  })  

  return hateoas;
}