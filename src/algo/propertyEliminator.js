const getEliminationReason = function(property,metrics) {
  if (metrics.estimatedPrice > 900000) {
    return "Automatic: Too expensive";
  }
  for (let t of metrics.travel) {
    if (t.duration > 60) {
      return "Automatic: Travel time too long";
    }
  }
  if (metrics.size && metrics.size.total) {
    let totalSize = parseFloat(metrics.size.total.value);
    if (totalSize < 70) {
      return "Automatic: Too small";
    }
  }

  return "";
}

module.exports = {
  getEliminationReason
}