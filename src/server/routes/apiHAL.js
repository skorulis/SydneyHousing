var hateoasLib = require("hateoas")

module.exports = function() {
  let hateoas = hateoasLib({baseUrl: "http://localhost:7900"});
  hateoas.registerLinkHandler("suburb", function(suburb) {
    return {
        "properties": "/" + suburb.name + "/properties"
    };
  })  
  return hateoas;
}