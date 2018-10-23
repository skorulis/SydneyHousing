let search = require("../algo/searchFunctions");

let result = search.performSearch("Canterbury",1)

result.then(function(x) {
  console.log(x)  
})
