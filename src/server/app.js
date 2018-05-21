const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require("./routes/api").setupRoutes(app);
require("./routes/web")(app)

module.exports = function() {
  return app;
};