'use strict';

/**
 * @ngdoc service
 * @name publicApp.TokenInterceptor
 * @description
 * # TokenInterceptor
 * Factory in the publicApp.
 */
angular.module('App')
  .factory('TokenInterceptor', function ($q,$window,AuthService) {
    return {
      request: function (config) {
        config.headers = config.headers || {};
        if ($window.sessionStorage.token) {
          config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
        }
        return config;
      },
      requestError: function(rejection) {
        return $q.reject(rejection);
      },
      response: function (response) {
        if (response != null && response.status == 200 && $window.sessionStorage.token && !AuthService.isAuthenticated) {
          AuthService.isAuthenticated = true;
        }
        return response || $q.when(response);
      },
      responseError: function(rejection) {
        if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthService.isAuthenticated)) {
          delete $window.sessionStorage.token;
          AuthService.isAuthenticated = false;
          $location.path("/admin/login");
        }
        return $q.reject(rejection);
      }
    };
  });
