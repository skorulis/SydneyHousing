const getDirectionsFilename = function(from,to,mode) {
  return `./results/${mode}/${from}-${to}.json`;
}

const getSuburbFilename = function(suburb) {
  return `./results/suburbs/${suburb}.html`;
}

const getSuburbJSONFilename = function(suburb) {
  return `./results/suburb-json/${suburb}.json`; 
}

module.exports = {
  getDirectionsFilename,
  getSuburbFilename,
  getSuburbJSONFilename
};