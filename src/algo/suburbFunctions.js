const fs = require("fs");
const suburbs = JSON.parse(fs.readFileSync('./inputs/all-suburbs.json', 'utf8'))

const getPostcode = function(suburb) {
	for (let sub of suburbs) {
		if (sub.name.toLowerCase() === suburb.toLowerCase()) {
			return sub.postcode;
		}
	}
	return null;
}

module.exports = {
	getPostcode
}