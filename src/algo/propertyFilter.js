const matchesFilter = function(filter,propertyJSON) {
  console.log("Do filter ");
  console.log(filter);

  if (!filter) {
    return true;
  }

  if (filter.sold != undefined) {
    let sold = propertyJSON.isSold === true;
    if (filter.sold != sold) {
      return false;
    }
  }
  if (filter.eliminated != undefined) {
    let eliminated = propertyJSON.eliminated && propertyJSON.eliminated.length > 0;
    if(filter.eliminated != eliminated) {
      return false;
    }
  }
  if (filter.visited != undefined) {
    let visited = propertyJSON.visited === true;
    if (filter.visited != visited) {
      return false;
    }
  }
  if (filter.hasPrice != undefined) {
    let hasPrice = propertyJSON.estimatedPrice > 0;
    if (filter.hasPrice != hasPrice) {
      return false;
    }
  }


  return true;
}

module.exports = {
  matchesFilter
}