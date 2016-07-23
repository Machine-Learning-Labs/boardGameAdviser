(function() {
  'use strict';

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
  angular

    .module('boardGameAdviser', ['ionic', 'ngAnimate', 'lokijs', 'angulartics', 'angulartics.google.analytics'])

    .constant('CONSTANTS', {
      DEFAULT_ENGINE: 'kdTree', /* id3 OR randomForest OR kdTree */
      MAX_NUMBER_OF_SOLUTIONS: 3,
      KEYWORD_DISCARD: 'discard',
      ATTR_TO_IGNORE : ['id','name','description', 'prize', 'url', 'image', 'guide'],
      STRING_ATTR_MAP: {
        modojuego:["competitivo","mixto","cooperativo"],
        tipojuego:["investigar", "agilizar", "imaginar","rolear", "apostar","gestion","invadir"],
        atmosfera: ["discard", "ciencia", "fantasia","historic", "medieval","zombies"],
        ocupacion:["small", "normal","large"]
      },
      DB: {
        DB_NAME: 'gamesDB',
        COL_NAME: 'games',
        PREFIX: {"prefix": "mordor"},
        AUTOSAVE: true,
        INTERVAL: 1000
      },
      AUTOSEND_SECONDS: 400,
      MIN_PERCENT_VALID: 42,
      URL_LOCAL_TRAINING_SET: './assets/training.json',
      URL_REMOTE_TRAINING_SET: 'http://www.mordorgames.es/datos/',
      URL_IMAGES: 'http://www.mordorgames.es/datos/images/',
      URL_GAMES: 'http://www.mordorgames.es/tienda',
      URL_BLOG: 'https://www.mordorgames.es/category/noticias/',
      URL_SHOP: 'https://www.mordorgames.es/tienda/12-juegos-de-mesa',
      YOUTUBE_URL: 'https://www.youtube.com/embed/',
      NEWS_URL: 'http://www.mordorgames.es/category/noticias/feed/'
    })

    .run(function($ionicPlatform, $ionicLoading, $log, Persistence, Data) {

      $ionicLoading.show({ template: 'Cargando...' });

      // Initialize the database.
      Persistence.initDB();

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

          if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
          //if(window.cordova && window.cordova.plugins.Keyboard) {
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

    .config(function($stateProvider, $urlRouterProvider, $analyticsProvider) {

      $analyticsProvider.virtualPageviews(false);
      $analyticsProvider.firstPageview(true);
      $analyticsProvider.withAutoBase(true);

      $stateProvider

        .state('app', {
          url: '/app',
          abstract: true,
          templateUrl: 'templates/menu.html'
        })

        .state('app.home', {
          url: '/home',
          views: {
            'menuContent': {
              templateUrl: 'templates/home.html',
              controller: 'HomeController as home'
            }
          }
        })
        .state('app.questions', {
          url: '/questions',
          views: {
            'menuContent': {
              templateUrl: 'templates/question.html',
              controller: 'QuestionController as question'
            }
          }
        })
        .state('app.result', {
          url: '/result',
          views: {
            'menuContent': {
              templateUrl: 'templates/result.html',
              controller: 'ResultController as result'
            }
          }
        })
        .state('app.inventory', {
          url: '/inventory',
          views: {
            'menuContent': {
              templateUrl: 'templates/inventory.html',
              controller: 'InventoryController as inventory'
            }
          }
        });

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/app/home');

    });

})();
