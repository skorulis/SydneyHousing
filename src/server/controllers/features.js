let fs = require('fs');

const getAllFeatures = function(req,res,next) {
  let params = JSON.parse(fs.readFileSync("./inputs/params.json", 'utf8'));
  res.send(params.features);
}

module.exports = {
  getAllFeatures
}
