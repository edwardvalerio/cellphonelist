var express = require('express');
var app = express();
var port = 3000;
var bodyParser = require('body-parser');
var routeController = require('./controller/cell-controller');


// firebase
var admin = require('firebase-admin');
var serviceAccount = require('./services/credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cellphone-directory.firebaseio.com"
});

// database

var database = admin.database().ref("/cellphones");
// later var storage = admin.storage().ref("/images");


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

routeController(app, database);


app.listen(port);
console.log('listening on port: ' + port);
