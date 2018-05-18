const controllers = require("../controllers");

const setupRoutes = function(app) {
  app.get("/suburbs",controllers.suburbs.listSuburbs);
  app.get("/:suburb/properties",controllers.suburbs.suburbProperties);
  app.get("/property/update/:pid",controllers.properties.updateProperty);
}

module.exports = {
  setupRoutes
};