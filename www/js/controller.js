(function() {
  'use strict';

  angular
    .module('boardGameAdviser')
    .controller('BarController', BarController)
    .controller('MenuController', MenuController)
    .controller('HomeController', HomeController)
    .controller('QuestionController', QuestionController)
    .controller('ResultController', ResultController)
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
  MenuController.$inject = ['CONSTANTS', '$state'];
  function MenuController(CONSTANTS, $state) {

    var vm = this;
    vm.close = close;
    vm.message = message;
    vm.link = link;

    ////////////

    function link(id) {
      var remote_url;
      switch (id) {
        case "news": remote_url = CONSTANTS.URL_BLOG; break;
        case "shop":
        default: remote_url = CONSTANTS.URL_SHOP; break;
      }

      window.open(remote_url,'_system');
    }

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
  HomeController.$inject = ['Data', '$state', '$analytics'];
  function HomeController(Data, $state, $analytics) {

    var vm = this;
      vm.ready = true;
      vm.textButton = "Adelante";
      vm.run = run;

    Data.clear();
    $analytics.pageTrack('/home');

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
  QuestionController.$inject = ['CONSTANTS', 'Data', '$state', '$timeout', '$analytics'];
  function QuestionController(CONSTANTS, Data, $state, $timeout, $analytics) {

    var vm = this;
    vm.style = '';
    vm.prematureFinish = false;
    vm.save = save;
    vm.ignore = ignore;
    vm.previous = previous;
    vm.counter = 0;

    next();
    $analytics.pageTrack('/question/'+vm.counter++);

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

    // TODO finish this metohd
    function previous() {
      vm.currentQuestion = Data.getPreviousQuestion(vm.currentQuestion.attr);
    }

    function save() {

      $timeout(function() {

        Data.put(vm.currentQuestion.attr, vm.currentQuestion.reply);

        vm.style = 'animated bounceInRight';
        vm.prematureFinish = (CONSTANTS.MIN_PERCENT_VALID<=vm.currentQuestion.percent);
        next();

      }, CONSTANTS.AUTOSEND_SECONDS);

      vm.style = 'animated bounceOutLeft';

      $analytics.pageTrack('/question/'+vm.counter++);
      $analytics.eventTrack('question', {  category: vm.currentQuestion.attr, label: vm.currentQuestion.reply });

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
  ResultController.$inject = ['CONSTANTS', 'Utils', 'Data', 'Logic','$state', '$analytics'];
  function ResultController(CONSTANTS, Utils, Data, Logic, $state, $analytics) {

    var vm = this;
    vm.input = {};
    vm.prediction = {};
    vm.alternatives = [];

    vm.reset = reset;
    vm.goToLink = goToLink;

    Logic.predict(CONSTANTS.DEFAULT_ENGINE)
      .then(function(res) {

        vm.alternatives = res;

        Utils._.each(res,function(game) {
          $analytics.eventTrack('result', { category: 'results', label: game.name });
        })

      })
      .catch(function(err) {
        $state.go('app.home');
      });

    $analytics.pageTrack('/result');

    ////////////

    function goToLink(url) {

      $analytics.pageTrack('/end');
      $analytics.eventTrack('out', { category: 'result_buy', label: url });

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
  InventoryController.$inject = ['CONSTANTS', 'Data', 'Inventory', 'Utils', '$analytics'];
  function InventoryController(CONSTANTS, Data, Inventory, Utils, $analytics) {

    var vm = this;
      vm.desired = [];
      vm.owned = [];
      vm.addGame = addGame;
      vm.delGame = delGame;

    vm.all = Data.getGames();

    Inventory.getAllGamesSaved().then(function (saved) {

      if (vm.all.length===0) {
        throw "Not games loaded"
      }

      vm.owned = Utils._.uniq(saved)
      vm.desired = Utils._.uniq(Utils._.differenceBy(vm.all, vm.owned,'id'));

    });

    $analytics.pageTrack('/inventory');

    ////////////

    function addGame(game) {

      vm.owned.push(game);
      Utils._.pull(vm.desired,game)

      Inventory.saveGame(game);
    }

    function delGame(game) {

      vm.desired.push(game);
      Utils._.pull(vm.owned,game)

      Inventory.eraseGame(game);
    }
  }

})();
