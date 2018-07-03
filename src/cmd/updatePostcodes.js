let fs = require('fs');

let suburbs = JSON.parse(fs.readFileSync('./inputs/all-suburbs.json', 'utf8'))

for (let sub of suburbs) {
  let detailFilename = "./results/suburb-json/" + sub.name + ".json";
  let details = JSON.parse(fs.readFileSync(detailFilename, 'utf8'))
  sub.postcode = details.postcode;
  console.log(details)
}

fs.writeFile("./inputs/all-suburbs.json", JSON.stringify(suburbs,null,2),function(err){});