var app = angular.module('phonedirectory', ['ui.router', 'ngCookies']);


app.run(function ($state, $rootScope) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        event.preventDefault(); /* listen for resolve errors **/
        switch (error) {
            case 'not_logged':
                $state.go('root.login', {
                    loginMsg: 'You need to be logged in to access that page!'
                });
        }
    });
});


app.factory('Auth', function ($http, $q, $timeout, $state, $rootScope, $window, $cookies) {
    var profile = null || $cookies.get('profile');


    var login = function (em, pass) {
        var info = {
            email: em,
            pass: pass
        }
        $http.post('/users/login', info).then(function (response) {
            profile = response.data;
            var today = new Date();
            var expiration = new Date(today);
            expiration.setMinutes(today.getMinutes() + 59);
            $cookies.put('profile', profile, {
                'expires': expiration
            }); /* 1 = 1 minute */
            $state.go('root.main');
            $rootScope.$broadcast('user:logged', profile);
        }).catch(function (err) {
            console.log(err)
        });
    }


    var logout = function () {
        profile = null;
        $cookies.remove('profile');
        $rootScope.$broadcast('user:logged', profile);
        $state.go('root.login', {
            loginMsg: 'Logged out!'
        });
        return true;
    }


    var isLoggedIn = function () {
        var deferred = $q.defer();
        if (profile) {
            deferred.resolve('logged_in');
        } else {
            deferred.reject('not_logged');
        }
        return deferred.promise;
    }


    return ({
        login: login,
        logout: logout,
        isLoggedIn: isLoggedIn,
        profile: profile
    });


});


app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home/login');
    $stateProvider.state('root', {
        url: '/home',
        abstract: true,
        templateUrl: "views/global.html",
        controller: 'global'
    }).state('root.main', {
        url: '/main',
        views: {
            'content': {
                templateUrl: "views/main.html",
                controller: 'cellphones'
            }
        },
         resolve: {
            user: function (Auth) {
                return Auth.isLoggedIn();
            }
        }
    }).state('root.add', {
        url: '/add-cell',
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
            user: function (Auth) {
                return Auth.isLoggedIn();
            }
        }
    }).state('root.single', {
        url: '/single/:key',
        views: {
            'content': {
                templateUrl: "views/single.html",
                controller: 'singlephones'
            }
        },
         resolve: {
            user: function (Auth) {
                return Auth.isLoggedIn();
            }
        }


    }).state('root.login', {
        url: '/login',
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


app.controller('global', function ($scope, Auth) {

    /* init state */
    $scope.auth = Auth.profile; /* listen for user logging status broadcast */
    $scope.$on('user:logged', function (event, data) {
        $scope.auth = data;
    });
    $scope.logout = function () {
        Auth.logout();
    }
});



app.controller('cellphones', function ($scope, $http) {

    $scope.pagesizes = [3,5,10,15];
    $scope.pagesize = $scope.pagesizes[0];
    $scope.mquery = '';
    $scope.currentPage = 0;
    $scope.totalPages = 0;
    $scope.data = [];
    $scope.originalData = [];




    $scope.loaditems = function() {

    $http.get('/api/cellphones').then(function (response) {

        if($scope.data != null) {
          $scope.data.length = 0;
        }

        // convert JSON to an actual array
           var arr = [];
            angular.forEach(response.data, function(value, key){
                arr.push(value);
            });

         $scope.data = arr.slice().reverse();
         $scope.originalData = arr.slice().reverse();

         $scope.setpagination();


    }).catch(function (err) {
       console.log(err)
    });

    }



    $scope.delete = function(key) {

        if (confirm("Confirm deletion")) {

      $http.delete('/api/cellphones/'+key).then(function(response){

            console.log('deleted item key '+ key);
            $scope.loaditems();

        }).catch(function(err){

            console.log(err);

        });
    }
    }

    // filtering

    $scope.$watch('mquery', function(newv, oldv){

        // set the index page at 0 since we ill treat this as new query
        $scope.currentPage = 0;

        $scope.data = $scope.originalData.filter(function (el) {

            newv = angular.lowercase(newv);
            var name = angular.lowercase(el.name);
            var description = angular.lowercase(el.description);
            var brand = angular.lowercase(el.brand);



            if(name.indexOf(newv) >= 0 || description.indexOf(newv) >= 0 || brand.indexOf(newv) >= 0  ) {
               return el;
               }
            });
    });


    // pagination stuff

    $scope.setpagination = function() {
          $scope.totalPages = Math.ceil((($scope.data.length-1)/$scope.pagesize));

    }

     $scope.total = function() {
          $scope.totalPages = Math.ceil((($scope.data.length-1)/$scope.pagesize));
         if($scope.totalPages == 0){

            return 1;

            }
            else {

             return $scope.totalPages;
            }


    }

    $scope.next = function() {

        if($scope.currentPage < $scope.totalPages-1  ) {
            $scope.currentPage++;
        }

    }

    $scope.prev = function() {

         if($scope.currentPage > 0  ) {
            $scope.currentPage--;
        }

    }


    // execute functions

    $scope.loaditems();


});




app.controller('login', function ($scope, $http, Auth, $stateParams, $state) {
    $scope.customError = $stateParams.loginMsg; /* or $state.params.loginError */
    $scope.email = 'demo@demo.com';
    $scope.password = 'demo0606';
    $scope.loginuser = function () {
        Auth.login($scope.email, $scope.password);
    }
});


app.controller('addphones', function ($scope, $http, $window, Auth) {
    $scope.form = {
        name: "",
        brand: "",
        description: "",
        file: "",
    }
    $scope.submit = function (isValid) {
        if (isValid) {
            var content = new FormData();
            content.append('image', angular.element('#file')[0].files[0]);
            content.append('name', $scope.form.name);
            content.append('brand', $scope.form.brand);
            content.append('description', $scope.form.description);
            var config = {
                transformRequest: angular.identity,
                headers: {
                    "Content-Type": undefined,
                }
            }; /* var data = { name: $scope.form.name, brand: $scope.form.brand, description: $scope.form.description, image: content } */
            $http.post('/api/addphone', content, config).then(function (response) {
                console.log('Success'); /* clear fields */
                angular.forEach(angular.element(".form input, textarea"), function (inputElem) {
                    angular.element(inputElem).val('');
                });

                $scope.customNotification = 'New cellphone entry added!';

            }).catch(function (err) {
                console.log(err);
            });
        } else {
            alert('complete the fields first!');
        }
    }
});


app.controller('singlephones', function ($scope, $stateParams, $http) {
    $scope.key = $stateParams.key;
    $scope.itemdata = "";
    $http.get('/api/cellphones/' + $scope.key).then(function (response) {
        $scope.itemdata = response.data;
    }).catch(function (err) {
        console.log(err);
    });
}); /* directives for valid file_exists and file upload */


app.directive('validFile', ['$parse', function ($parse) {
    return {
        require: 'ngModel',
        link: function (scope, el, attrs, ngModel) {
            var onChange = $parse(attrs.ngFiles);
            el.bind('change', function () {
                onChange(scope, {
                    $files: event.target.files
                });
                scope.$apply(function () {
                    ngModel.$setViewValue(el.val());
                    ngModel.$render();
                });
            });
        }
    }
}]);
