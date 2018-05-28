const maxSize = 200;

const landSizeWeighting = function(size) {
  let defSize = 100;
  let diff = maxSize - defSize;
  let usefulSize = Math.min(size,maxSize);
  
  if (size <= defSize) {
    return 1;
  }
  return 1 - ((usefulSize - defSize)/diff) * 0.25 

}

const landScoreDivider = function(size) {
  let weighting = landSizeWeighting(size);
  let usefulSize = Math.min(size,maxSize);
  return weighting * usefulSize;
}

const calculateBaseScore = function(metrics) {
  if (!metrics.costs.yearly) {
    return null;
  }
  return metrics.costs.yearly + metrics.costs.virtual.travel + metrics.costs.virtual.shopping;
}

const calculateSimpleScore = function(metrics) {
  let baseScore = calculateBaseScore(metrics);
  if (!baseScore) {
    return null;
  }

  baseScore = (baseScore / 100).toFixed(0);
  return -parseFloat(baseScore);
}

const calculateSizeScore = function(metrics) {
  let propSize = metrics.size.total || metrics.size.land
  if (!propSize) {
    return null;
  }
  let baseScore = calculateBaseScore(metrics);
  if (!baseScore) {
    return null;
  }
  let size = parseFloat(propSize.value);

  let divider = landScoreDivider(size);

  if (metrics.size.multiplier) {
    divider *= metrics.size.multiplier
  }



  let score = (baseScore / divider).toFixed(0);
  return -parseFloat(score)
}

module.exports = {
  landSizeWeighting,
  landScoreDivider,
  calculateSizeScore,
  calculateSimpleScore
}