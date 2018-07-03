let hateoas = require("../routes/apiHAL")

const getRoot = function(req,res,next) {
  let result = {};
  hateoas(req.headers.host).link("root",result);
  res.send(result);
}

module.exports = {
  getRoot
}