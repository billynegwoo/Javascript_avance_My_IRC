'use strict';

/**
 * @ngdoc overview
 * @name publicApp
 * @description
 * # publicApp
 *
 * Main module of the application.
 */
angular.module('App', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute'
  ]).config(function ($routeProvider,$httpProvider) {
  $httpProvider.interceptors.push('TokenInterceptor');
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
      })
      .when('/home', {
        templateUrl: 'views/about.html',
        controller: 'UserCtrl',
        access: {requiredLogin: true}
      })
      .when('/admin', {
        templateUrl: 'views/about.html',
        controller: 'UserCtrl',
        access: {requiredLogin: true}
      })
      .otherwise({
        redirectTo: '/'
      });
  });

angular.module('App')
  .run(function($rootScope, $location, $window, AuthService) {
  $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
    if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredLogin
      && !AuthService.isAuthenticated && !$window.sessionStorage.token) {
      $location.path("/login");
    }
  });
});
