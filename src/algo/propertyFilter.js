function getAge(timeString) {
  let seenDate = new Date(timeString)
  let today = new Date();
  let diff = today.getTime() - seenDate.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

const matchesFilter = function(filter,propertyJSON) {
  //console.log(filter);

  if (!filter) {
    return true;
  }
  if (propertyJSON.missing) {
    return false;
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
  if (filter.minAge != undefined && filter.minAge.length > 0) {
    let age = getAge(propertyJSON.firstSeen)
    if (age < parseInt(filter.minAge)) {
      return false;
    }
  }
  if (filter.minUpdated != undefined && filter.minUpdated.length > 0) {
    let age = getAge(propertyJSON.lastUpdated)
    if (age < parseInt(filter.minUpdated)) {
      return false;
    }
  }
  if (filter.maxTravel && filter.maxTravel.length > 0) {
    let time = parseInt(filter.maxTravel)
    for (let travel of propertyJSON.travel) {
      if (travel.duration > time) {
        return false;
      }
    }
  }
  if (filter.stars && filter.stars.length > 0) {
    if (filter.stars === "none") {
      if (propertyJSON.rating) {
        return false;
      }
    } else {
      let stars = parseFloat(filter.stars);
      if (!propertyJSON.rating || propertyJSON.rating < stars) {
        return false;
      }  
    }
  }
  if (filter.suburb && filter.suburb.length > 0) {
    if (propertyJSON.suburb.toLowerCase() !== filter.suburb.toLowerCase()) {
      return false;
    }
  }


  return true;
}

module.exports = {
  matchesFilter
}