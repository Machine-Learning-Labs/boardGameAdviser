(function() {
  'use strict';

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular

  .module('boardGameAdviser', ['ionic', 'ngAnimate'])

  .constant('CONSTANTS', {
    DEFAULT_ENGINE: 'kdTree',
    MAX_NUMBER_OF_SOLUTIONS: 5,
    KEYWORD_DISCARD: 'discard',
    ATTR_TO_IGNORE : ['id','name','description', 'prize', 'url'],
    STRING_ATTR_MAP: {
      modojuego:["competitivo","mixto","cooperativo"],
      tipojuego:["investigar", "agilizar", "imaginar","rolear", "apostar","gestion","invadir"],
      atmosfera: ["discard", "ciencia", "fantasia","historic", "medieval","zombies"],
      ocupacion:["small", "normal","large"]
    },
    AUTOSEND_SECONDS: 300,
    MIN_PERCENT_VALID: 12,
    URL_LOCAL_TRAINING_SET: './assets/training.json',
    URL_REMOTE_TRAINING_SET: 'http://www.mordorgames.es/datos/'
  })

  .run(function($ionicPlatform, $ionicLoading, $log, Data) {

    $ionicLoading.show({ template: 'Cargando...' });

    Data.start()
      .then(function(res) {
        $log.info(res + ' juegos cargados')
        $ionicLoading.hide();
      })
      .catch(function(res) {
        $log.err(res);
        $ionicLoading.hide();
        ionic.Platform.exitApp();
      });

    $ionicPlatform.ready(function() {

      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }

      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })

  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'HomeController as home'
      })

      .state('questions', {
        url: '/questions',
        templateUrl: 'templates/question.html',
        controller: 'QuestionController as question'
      })

      .state('result', {
        url: '/result',
        templateUrl: 'templates/result.html',
        controller: 'ResultController as result'
      })

      .state('admin', {
        url: '/admin',
        templateUrl: 'templates/admin.html',
        controller: 'AdminController as admin'
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/home');
  });

})();
