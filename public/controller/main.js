var app = angular.module('phonedirectory',['ui.router']);

app.config(function($stateProvider, $urlRouterProvider){

  $urlRouterProvider.otherwise('/home/main');


  $stateProvider
  .state('root',{ //Main Layout View
    url: '/home',
    abstract: true,
    templateUrl: "views/global.html", //Points to the HTML File
    controller: 'global' //Angular tells the page to use this controller
  })

  .state('root.main',{
    url: '/main' ,
    views: {
     'content': {
     templateUrl: "views/main.html",
     controller: 'cellphones'
        }
    }
  })


   .state('root.add',{
    url: '/add-cell' ,
    views: {
     'content': {
     templateUrl: "views/add.html",
     controller: 'addphones'
        }
    }
  })


  .state('root.single',{
    url: '/single/:key' ,
    views: {
     'content': {
     templateUrl: "views/single.html",
     controller: 'singlephones'
        }
    }
  })



});


app.controller('cellphones', function($scope,$http){


   $scope.data = "";
   $http.get('/api/cellphones').then(function(response){

   $scope.data = response.data;

     }).catch(function(err){
         alert(err);
     });

});


app.controller('global', function($scope){




});


app.controller('addphones', function($scope,$http, $window){


    $scope.form = {

        name: "",
        brand: "",
        description: "",
        file: "",


    }


    $scope.submit = function(isValid) {

    if(isValid) {

        var content  = new FormData();
       // contentFile.append('fileUpload', angular.element('#file').files[0]);
        content.append('image', angular.element('#file')[0].files[0]);
        content.append('name',$scope.form.name);
        content.append('brand',$scope.form.brand);
        content.append('description',$scope.form.description);

        var config = {
             transformRequest: angular.identity,
            headers: {
                   "Content-Type": undefined,
                  }
               };

       /* var data = {

            name: $scope.form.name,
            brand: $scope.form.brand,
            description: $scope.form.description,
            image: content

        } */


         $http.post('/api/addphone', content, config).then(function(response){

            console.log('Success');

            // clear fields

              angular.forEach(
                  angular.element(".form input, textarea"),
                  function(inputElem) {
                      angular.element(inputElem).val(null);
                  });


        }).catch(function(err){

            alert(err);


        });


    }

        else {

            alert('complete the fields first!');

        }




    }



});


app.controller('singlephones', function($scope, $stateParams,$http){


    $scope.key = $stateParams.key;

    $scope.itemdata = "";

    $http.get('/api/cellphones/' + $scope.key).then(function(response){

     $scope.itemdata = response.data;



    }).catch(function(err){

           aleret(err);
    });


});



// directives for valid file_exists // and file upload

app.directive('validFile',['$parse', function($parse){
  return {
    require:'ngModel',
    link:function(scope,el,attrs,ngModel){

        var onChange = $parse(attrs.ngFiles);

      el.bind('change',function(){

          onChange(scope, { $files: event.target.files });
          scope.$apply(function(){

          ngModel.$setViewValue(el.val());
          ngModel.$render();
        });
      });
    }
  }
}]);


