var path = require('path');

const index = function(req,res,next) {
  res.sendFile(path.join(__dirname + '/../../web/index.html'));
}

module.exports = function(app) {
  app.get("/",index);
};