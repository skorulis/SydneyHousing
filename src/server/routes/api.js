const controllers = require("../controllers");

const setupRoutes = function(app) {
  app.get("/suburbs",controllers.suburbs.listSuburbs);
  app.get("/:suburb/properties",controllers.suburbs.suburbProperties);
  app.get("/property/update/:pid",controllers.properties.updateProperty);
  app.post("/property/:suburb/:pid/setFields",controllers.properties.setPropertyFields);
  app.get("/property/:suburb/:pid/",controllers.properties.getPropertyDetails);

  app.get("/inspections",controllers.inspections.getAllInspections)
}

module.exports = {
  setupRoutes
};