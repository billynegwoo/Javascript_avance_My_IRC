'use strict';

/**
 * @ngdoc function
 * @name publicApp.controller:UserCtrl
 * @description
 * # UserCtrl
 * Controller of the publicApp
 */
angular.module('App')
  .controller('UserCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthService',
    function ($scope, $location, $window, UserService, AuthService) {
      $scope.login = function (username, password) {
        $scope.logged = ($window.sessionStorage.token == undefined);
        if (username !== undefined && password !== undefined) {
          UserService.login(username, password).success(function (data) {
            if (data.success) {
              AuthService.isAuthenticated = true;
              $window.sessionStorage.token = data.token;
              $window.sessionStorage.user = data.user;
              $location.path('/home')
            } else {
                alert(data.message)
            }
          }).error(function (status, data) {
            console.log(status, data)
          })
        }
      };
      $scope.register = function (username, password, email) {
        if (username !== undefined && password !== undefined && email !== undefined) {
          UserService.register(username, password, email).success(function (data) {
            if(data.success){
              $location.path('/')
            }else if(!data.success){
              alert(data.message)
            }
          }).error(function (status, data) {
            console.log(status, data)
          })
        }
      };
    }]);
