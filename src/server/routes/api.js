const controllers = require("../controllers");

module.exports = (app) => {
  app.get("/suburbs",controllers.suburbs.listSuburbs);
  app.get("/:suburb/properties",controllers.suburbs.suburbProperties);
};