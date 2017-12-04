var app = angular.module('phonedirectory',['ui.router']);

app.run(function($state,$rootScope) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    event.preventDefault();

   // listen for resolve errors

    switch(error) {
       case 'not_logged':
          $state.go('root.login', {loginMsg: 'You need to be logged in to access that page!'});
    }


  });
});


app.factory('Auth', function($http,$q,$timeout,$state,$rootScope){

    var profile = null;


    var login = function(em,pass) {


          var info = {

            email: em,
            pass: pass

        }




$http.post('/users/login', info).then(function(response){


        profile = response.data;
        $state.go('root.add');
      $rootScope.$broadcast('user:logged',profile);





        }).catch(function(err){

            console.log(err)

        });

    }

    var logout = function() {

        profile = null;

       $rootScope.$broadcast('user:logged',profile);
        $state.go('root.login', {loginMsg: 'Logged out!'});




        return true;

    }

    var isLoggedIn = function() {

    var deferred = $q.defer();


      if(profile) {
             deferred.resolve('logged_in');
        }
        else {
             deferred.reject('not_logged');
        }

        return deferred.promise;

    }


    return({

        login: login,
        logout: logout,
        isLoggedIn: isLoggedIn,
        profile: profile

    });


});


app.config( function($stateProvider, $urlRouterProvider){

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
    data: {
     pageTitle: 'Add Cell'
    },
    views: {
     'content': {
     templateUrl: "views/add.html",
     controller: 'addphones'
        }
    },
      resolve: {

           user: function(Auth) {

               return Auth.isLoggedIn();

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

  .state('root.login',{
    url: '/login' ,
    params: {
        loginMsg: null
    },
    views: {
     'content': {
     templateUrl: "views/login.html",
     controller: 'login'
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


app.controller('global', function($scope, Auth){

     // init state
    $scope.auth = Auth.profile;


   // listen for user logging status
    $scope.$on('user:logged', function(event,data){

      $scope.auth = data;

    });

   $scope.logout = function(){
        Auth.logout();
    }



});

app.controller('login', function($scope,$http, Auth,$stateParams,$state){


    $scope.customError = $stateParams.loginMsg; // or $state.params.loginError



    $scope.test = "works";
    $scope.email = 'demo@demo.com';
    $scope.password = 'demo0606';


    $scope.loginuser = function(){

    Auth.login($scope.email, $scope.password);


    }



});


app.controller('addphones', function($scope,$http, $window, Auth){




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

            console.log(err);


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

           console.log(err);
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




