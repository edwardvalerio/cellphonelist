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
         console.log(response);
     }).catch(function(err){
         alert(err);
     });

});


app.controller('global', function($scope){




});


app.controller('addphones', function($scope){




});


app.controller('singlephones', function($scope, $stateParams){


    $scope.key = $stateParams.key;




});
