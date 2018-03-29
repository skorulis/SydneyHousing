const getDirectionsFilename = function(from,to,mode) {
  return `./results/${mode}/${from}-${to}.json`;
}

const getSuburbFilename = function(suburb) {
  return `./results/suburbs/${suburb}.html`;
}

module.exports = {
  getDirectionsFilename,
  getSuburbFilename
};