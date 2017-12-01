var express = require('express');
var app = express();
var port = 3000;
var bodyParser = require('body-parser');
var routeController = require('./controller/cell-controller');

var multer = require('multer');
var storage = multer({ dest: './tmp' });


// firebase
var admin = require('firebase-admin');
var serviceAccount = require('./services/credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cellphone-directory.firebaseio.com"
});

// database

var database = admin.database().ref("/cellphones");


// storage


var keyFilename="./services/credentials.json"; //replace this with api key file
var projectId = "cellphone-directory" //replace with your project id
var bucketName = `${projectId}.appspot.com`;

var mime = require('mime');
var gcs = require('@google-cloud/storage')({
    projectId,
    keyFilename
});

var bucket = gcs.bucket(bucketName);




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

routeController(app, database, bucket, storage);


app.listen(port);
console.log('listening on port: ' + port);
