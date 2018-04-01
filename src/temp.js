let fs = require('fs');

let woolworths = fs.readFileSync("./inputs/woolworths.txt", 'utf8').split("\n");

let shops = []
let currentShop;
let state = 0;
let address = "";


for (let line of woolworths) {
  if (line == "SUPERMARKETS") {
    currentShop = {};
    state = 1;
  } else if (state == 1) {
    currentShop["name"] = line
    state = 2;
  } else if (state == 2) {
    state = 3;
  } else if (state == 3) {
    address = line
    state = 4;
  } else if (state == 4) {
    address = address + line
    currentShop["address"] = address;
    shops.push(currentShop);  
    state = 0;
  }

}

fs.writeFile("./inputs/woolworths.json", JSON.stringify(shops,null,2),function(err){

});