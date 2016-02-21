'use strict';

/**
 * @ngdoc service
 * @name publicApp.user
 * @description
 * # user
 * Service in the publicApp.
 */
angular.module('App')
  .service('UserService', function ($http) {
    return {
      login:function(username,password){
        return $http.post('http://localhost:3000/auth/login',{username: username, password: password})
      },
      logout:function(){
      },
      register:function(username,password,email){
        return $http.post('http://localhost:3000/auth/register',{username: username, password: password, email: email})
      }
    }
  });
