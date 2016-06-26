(function() {
  'use strict';

  angular
    .module('boardGameAdviser')
    .controller('BarController', BarController)
    .controller('MenuController', MenuController)
    .controller('HomeController', HomeController)
    .controller('QuestionController', QuestionController)
    .controller('ResultController', ResultController)
    .controller('NewsController', NewsController)
    .controller('InventoryController', InventoryController);

  /**
   *
   * @param $state
   * @param $ionicSideMenuDelegate
   * @constructor
   */
  BarController.$inject = ['$state','$ionicSideMenuDelegate'];
  function BarController($state,$ionicSideMenuDelegate) {

    var vm = this;
      vm.secret = secret;
      vm.toggleLeft = toggleLeft;

    ////////////

    function toggleLeft() {
      $ionicSideMenuDelegate.toggleLeft();
    }

    function secret() {
      $state.go('app.home');
    }

  }

  /**
   *
   * @param $state
   * @constructor
   */
  MenuController.$inject = ['$state'];
  function MenuController($state) {

    var vm = this;
    vm.close = close;
    vm.message = message;

    ////////////

    function message() {
      $state.go('app.home');
    }

    function close() {
      ionic.Platform.exitApp();
    }

  }


  /**
   *
   * @param Data
   * @param $state
   * @constructor
   */
  HomeController.$inject = ['Data', '$state'];
  function HomeController(Data, $state) {

    var vm = this;
      vm.ready = true;
      vm.textButton = "Adelante";
      vm.run = run;


    Data.clear();

    ////////////

    function run() {
      $state.go('app.questions');
    }

  }

  /**
   *
   * @param CONSTANTS
   * @param Data
   * @param $state
   * @param $timeout
   * @constructor
   */
  QuestionController.$inject = ['CONSTANTS', 'Data', '$state', '$timeout'];
  function QuestionController(CONSTANTS, Data, $state, $timeout) {

    var vm = this;
    vm.style = '';
    vm.prematureFinish = false;
    vm.save = save;
    vm.ignore = ignore;
    vm.previous = previous;

    next();

    ////////////

    function next() {

      vm.currentQuestion = Data.getQuestion();

      if (vm.currentQuestion.percent >= 99 || vm.currentQuestion.text===undefined) {
        $state.go('app.result');
      }
    }

    function ignore() {
      vm.currentQuestion.reply = CONSTANTS.KEYWORD_DISCARD;
      save();

    }

    function previous() {
      vm.currentQuestion = Data.getPreviousQuestion(vm.currentQuestion.attr);
    }

    function save() {

      $timeout(function() {

        if (vm.currentQuestion.reply !==CONSTANTS.KEYWORD_DISCARD || !vm.currentQuestion.reply) {
          Data.put(vm.currentQuestion.attr, vm.currentQuestion.reply);
        }

        vm.style = 'animated bounceInRight';
        vm.prematureFinish = (CONSTANTS.MIN_PERCENT_VALID<=vm.currentQuestion.percent);
        next();

      }, CONSTANTS.AUTOSEND_SECONDS);

      vm.style = 'animated bounceOutLeft';

    }

  }

  /**
   *
   * @param CONSTANTS
   * @param Data
   * @param Logic
   * @param $state
   * @constructor
   */
  ResultController.$inject = ['CONSTANTS', 'Data', 'Logic','$state'];
  function ResultController(CONSTANTS, Data, Logic, $state) {

    var vm = this;
    vm.input = {};
    vm.prediction = {};
    vm.alternatives = [];

    vm.reset = reset;
    vm.goToLink = goToLink;

    Logic.predict(CONSTANTS.DEFAULT_ENGINE)
      .then(function(res) { vm.alternatives = res; })
      .catch(function(err) {
        $state.go('app.home');
      });

    ////////////

    function goToLink(url) {

      var remote_url = CONSTANTS.URL_GAMES + url;
      window.open(remote_url,'_system');
    }

    function reset() {
      Data.clear();
      $state.go('app.home');
    }
  }

  /**
   *
   * @param CONSTANTS
   * @param $http
   * @constructor
   */
  NewsController.$inject = ['CONSTANTS', '$http'];
  function NewsController(CONSTANTS, $http) {

    var vm = this;
      vm.list = {};
      vm.init = init;

    ////////////

    function init() {
      $http.get(CONSTANTS.NEWS_URL, { params: { "v": "1.0", "q": "https://www.thepolyglotdeveloper.com/feed/" } })
        .success(function(data) {
          vm.rssTitle = data.responseData.feed.title;
          vm.rssUrl = data.responseData.feed.feedUrl;
          vm.rssSiteUrl = data.responseData.feed.link;
          vm.entries = data.responseData.feed.entries;
        })
        .error(function(data) {
          console.log("ERROR: " + data);
        });
    }

  }

  /**
   *
   * @param CONSTANTS
   * @param $http
   * @constructor
   */
  InventoryController.$inject = ['CONSTANTS', '$http'];
  function InventoryController(CONSTANTS, $http) {

    var vm = this;

    ////////////

  }

})();
