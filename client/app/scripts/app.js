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
  'btford.socket-io',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'luegg.directives'
]).config(function ($routeProvider, $httpProvider) {
  $httpProvider.interceptors.push('TokenInterceptor');
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'UserCtrl',
      access: {requiredLogin: false}
    })
    .when('/register', {
      templateUrl: 'views/register.html',
      controller: 'UserCtrl',
      access: {requiredLogin: false}
    })
    .when('/home', {
      templateUrl: 'views/home.html',
      controller: 'ChatCtrl',
      access: {requiredLogin: true}
    })
    .otherwise({
      redirectTo: '/'
    });
});

angular.module('App')
  .run(function ($rootScope, $location, $window, AuthService) {
    $rootScope.$on("$routeChangeStart", function (event, nextRoute, currentRoute) {
      if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredLogin
        && !AuthService.isAuthenticated && !$window.sessionStorage.token) {
        $location.path("/");
      } else if (AuthService.isAuthenticated && $window.sessionStorage.token) {
        $location.path("/home");
      }
    });
  });
