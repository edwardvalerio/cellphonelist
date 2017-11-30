

var application = function(app) {



    app.get("*", function(req,res,next){
       res.header("Access-Control-Allow-Origin", "*");
       next();
    })

  /*  app.get('/', function(req,res){

     res.send('test from controller');

    }); */

    app.get('/test/:id', function(req,res){

        var id = req.params.id;
        console.log('id is = '+ id);


    });





}







module.exports = application;
