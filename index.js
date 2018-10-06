const express = require('express')
var https = require('https');
var fs = require('fs');
const app = express()
var options = {
    key: fs.readFileSync('./privatekey.pem'),
    cert: fs.readFileSync('./server.crt')
};
app.use(express.static('pymaths'))

https.createServer(options, app).listen(8443);
// app.listen(3000, () => console.log('Server running on port 3000'))
