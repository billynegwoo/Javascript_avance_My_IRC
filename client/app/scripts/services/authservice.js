'use strict';

/**
 * @ngdoc service
 * @name App.AuthService
 * @description
 * # AuthService
 * Service in the App.
 */
angular.module('App')
  .service('AuthService', function () {
    return {
      isAuthenticated: false,
      isAdmin: false
    };
  });
