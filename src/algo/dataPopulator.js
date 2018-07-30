

const populateMetrics = function(metrics,property) {
    metrics.url = property.url();
    metrics.isSold = property.isSold();
    metrics["id"] = property.id();

    metrics["image"] = property.imageURL();
    metrics["address"] = property.address();
    metrics["suburb"] = property.suburb();

    return metrics;
}

module.exports = {
  populateMetrics
}