(function() {
  'use strict';

  angular
    .module('boardGameAdviser')
    .controller('barController', barController)
    .controller('HomeController', HomeController)
    .controller('QuestionController', QuestionController)
    .controller('ResultController', ResultController)
    .controller('AdminController', AdminController);

  barController.$inject = ['$state'];
  function barController($state) {

    var vm = this;
      vm.counter = 0;
      vm.secret = secret;

    ////////////

    function secret() {

      vm.counter++;
      console.log(vm.counter)

      if (vm.counter>=7) {
        $state.go('admin');
        vm.counter = 0;
      } else {
        $state.go('home');
      }
    }

  }

  HomeController.$inject = ['$state', '$ionicLoading'];
  function HomeController($state, $ionicLoading) {

    var vm = this;
      vm.ready = true;
      vm.textButton = "Adelante";
      vm.run = run;

    ////////////

    function run() {
      $state.go('questions');
    }

  }

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
        $state.go('result');
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

  ResultController.$inject = ['CONSTANTS', 'Data', 'Logic','Utils','$state'];
  function ResultController(CONSTANTS, Data, Logic, Utils, $state) {

    var vm = this;
    vm.reset = reset;
    vm.Utils = Utils;
    vm.input = {};
    vm.prediction = {};
    vm.alternatives = [];

    this.goToLink = function (url) {
      window.open(url,'_system');
    };

    //debugger;

    Logic.predict(CONSTANTS.DEFAULT_ENGINE).then(function(res) {

      debugger
      debugger

      var games = _.map(res, function(n) { return Data.getGame(n); },vm);
      vm.alternatives = vm.Utils.lodash.flatten(games);

    });

    ////////////

    function reset() {
      Data.clear();
      $state.go('home');
    }
  }

  AdminController.$inject = ['Data', 'Logic','Utils','$state'];
  function AdminController(Data, Logic, Utils, $state) {

    // debugger;

    var vm = this;
    vm.responses = {};
    vm.questions = Data.getAllQuestions();
    vm.think = think;
    vm.clear = clear;

    ////////////

    function think() {
      // TODO

    }

    function clear() {
      vm.responses = {};
    }
  }

})();
