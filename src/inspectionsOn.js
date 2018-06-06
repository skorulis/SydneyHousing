let inspectionHelpers = require("./algo/inspectionHelpers")

let suburbName = process.argv[2]
let suburb = suburbName ? helpers.getSuburb(suburbName) : null;
console.log(suburb)

let inspections = inspectionHelpers.findAllInspections(suburbName);
console.log(inspections)
