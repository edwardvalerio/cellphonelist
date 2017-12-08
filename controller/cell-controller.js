var mime = require('mime');
var projectId = "cellphone-directory" //replace with your project id
var bucketName = `${projectId}.appspot.com`;
var fs = require('fs');



var application = function(app,db, bucket, storage, userService) {



    app.get("*", function(req,res,next){
       res.header("Access-Control-Allow-Origin", "*");
       next();
    })


    // Auto

    app.post('/users/login', function(req,res){



        userService.authenticate(req.body.email, req.body.pass,

         function(error, authData) {

            if (error) {

                res.status(401).send( error );

            } else {
                return res.status(200).send(authData);
              }

         });

    });



    // API

    // get all list
    app.get('/api/cellphones', function(req,res){

        db.once('value', function(snapshot){

            res.send(snapshot.val());

        }, function (errorObject) {
        res.send( errorObject.code );

        });

    });

    // one single item

      app.get('/api/cellphones/:key', function(req,res){

       var key = req.params.key;
        db.child(key).once('value', function(snapshot){
        res.send(snapshot.val());
        }, function (errorObject) {
        res.send( errorObject.code );

      });
         });


        // delete

      app.delete('/api/cellphones/:key', function(req,res){

        var key = req.params.key;

        // perform fileName lookup based on key..

        db.child(key).once('value', function(snapshot){

        var data = snapshot.val();
        var fileLocation = 'images/' + data.fileName;

            bucket.file(fileLocation).delete(function(err,response){



          // successfully removed the file then proceed to delete the data.

            db.child(key).remove(function (err) {
            if(err){
                res.status(500).send( err );
            }
            else {

                 res.send({status: 'ok' });
            }
            });




            });



        }, function (errorObject) {
        res.send( errorObject.code );

        });




         });


      //add new

        app.post('/api/addphone', storage.any() , function(req,res){


              console.log(req.body, 'Body');
              console.log(req.files, 'files');

                // rename file from multer
    var date = new Date().getTime();
    var newFileName = date + '-' + req.files[0].originalname;
    var oldFile = req.files[0].destination + '/' + req.files[0].filename;
    var newFile = req.files[0].destination + '/' + newFileName;



     fs.rename(oldFile,newFile, function(err) {

         if (err) console.log('ERROR: ' + err);

        else {

            addToDBTask(req, res, db, bucket, storage, newFile, newFileName);

            }
                });




        });



}



var addToDBTask = function(req,res,db, bucket, storage, fPath, originalName) {


       // initiate file uploading first

        var filePath = fPath;
        var uploadTo = 'images/' + originalName;
        var fileMime = mime.lookup(filePath);

            bucket.upload(filePath, {
                destination: uploadTo,
                public: true,
                metadata: { contentType: fileMime, cacheControl: "public, max-age=300" }
            }, function (err, file) {
                if (err) {
             console.log(err);
                return;
                }
                else {


            // after uploading - complete firebase data add + delete file from local server

            var newRef = db.push();
            var key = newRef.key;
            var data = req.body;

            // add the key
            data['key'] = key;
            data['imgURL'] = createPublicFileURL(uploadTo);
            data['fileName'] = originalName;

            newRef.set(data, function(err) {

                 if(err) {
                     res.status(500).send({ error: "boo:(" });
                 }
                 else {
                 res.send({status: 'ok' });

                 }
            });


            // delete the file

            fs.unlinkSync(filePath);


                }

            });

       // end file upload

}


var createPublicFileURL = function(storageName) {
    return `http://storage.googleapis.com/${bucketName}/${storageName}`;

}






module.exports = application;
