var express = require('express');
var app = express();
var port = 3000;
var bodyParser = require('body-parser');
var routeController = require('./controller/cell-controller');



 // setup

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());

// routes

routeController(app);


app.listen(port);

console.log('listening on port: ' + port);
