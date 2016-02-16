'use strict';

/**
 * @ngdoc function
 * @name publicApp.controller:UserCtrl
 * @description
 * # UserCtrl
 * Controller of the publicApp
 */
angular.module('App')
  .controller('UserCtrl',['$scope', '$location', '$window', 'UserService', 'AuthService',
    function ($scope, $location, $window, UserService, AuthService) {
      $scope.login = function (username, password) {
        if (username !== undefined && password !== undefined) {
          UserService.login(username, password).success(function (data) {
            AuthService.isAuthenticated = true;
            $window.sessionStorage.token = data.token;
            $location.path('/home')
          }).error(function (status, data) {
            console.log(status, data)
          })
        }
      };
      $scope.logout = function logout() {
        if (AuthService.isAuthenticated == true) {
          AuthService.isAuthenticated = false;
          delete $window.sessionStorage.token;
          $location.path('/')
        }
      }
  }]);
