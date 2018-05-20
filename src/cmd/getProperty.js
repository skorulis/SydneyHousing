let propertyDetails = require("../algo/getPropertyDetails");

let result = propertyDetails.evaluateProperty(process.argv[2])

result.then(function(x) {
  console.log(x)  
})
