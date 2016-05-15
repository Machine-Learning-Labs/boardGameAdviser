// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular

  .module('boardGameAdviser', ['ionic', 'ngAnimate'])

  .constant('CONSTANTS', {
    NUMBER_OF_TREES: 3,
    ATTR_TO_IGNORE : ['name','description', 'prize', 'url'],
    MIN_PERCENT_VALID: 60,
    AUTOSEND_SECONDS: 300,
    URL_REMOTE_TRAINING_SET: 'http://www.mordorgames.es/datos/',
    KEYWORD_DISCARD: 'discard'
  })

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
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
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');
});

