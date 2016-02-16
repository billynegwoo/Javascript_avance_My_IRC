'use strict';

/**
 * @ngdoc service
 * @name publicApp.AuthService
 * @description
 * # AuthService
 * Service in the publicApp.
 */
angular.module('App')
  .service('AuthService', function () {
    var auth = {
      isLogged: false
    };
    return auth;
  });
