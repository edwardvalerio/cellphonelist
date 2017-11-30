var app = angular.module('phonedirectory',['ui.router']);

app.config(function($stateProvider, $urlRouterProvider){

  $urlRouterProvider.otherwise('/');



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
