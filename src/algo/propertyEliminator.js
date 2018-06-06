


const getEliminationReason = function(property,metrics) {
  if (metrics.estimatedPrice > 900000) {
    return "Automatic: Too expensive";
  }

  return "";
}

module.exports = {
  getEliminationReason
}