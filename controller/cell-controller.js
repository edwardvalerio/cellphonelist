

var application = function(app,db) {



    app.get("*", function(req,res,next){
       res.header("Access-Control-Allow-Origin", "*");
       next();
    })



    app.get('/test/:id', function(req,res) {

        var id = req.params.id;
        var newRef = db.push();
        var key = newRef.key;

       var data = {
           name: 'cell phone',
           id: id,
           key: key
       }

     newRef.set(data, function(err) {

         if(err) {
              res.send({status: 'bad' });
         }
         else {
           res.send({status: 'ok with id = ' + id });
          }

        });
    });


    // API

    // list
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










}







module.exports = application;
