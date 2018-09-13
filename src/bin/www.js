// This will be our application entry. We'll setup our server here.
const http = require('http');
const app = require('../server/app')();

const port = parseInt(process.env.PORT, 10) || 7900;
app.set('port', port);

console.log("START APP ON PORT: " + port);

const server = http.createServer(app);
server.listen(port);
