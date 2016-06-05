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


  HomeController.$inject = ['Status', '$state'];
  function HomeController(Status, $state) {

    var vm = this;
    vm.ready = false;
    vm.textButton = "Adelante";
    vm.run = run;

    Status.start()
      .then(function(res) {
        vm.ready = true;
      })
      .catch(function(res) {
        vm.ready = false;
        vm.textButton = "Intentar de nuevo más tarde";
      });

    ////////////

    function run() {
      $state.go('questions');
    }

  }

  QuestionController.$inject = ['CONSTANTS', 'Status', 'Utils', '$state', '$timeout'];
  function QuestionController(CONSTANTS, Status, Utils, $state, $timeout) {

    var vm = this;
    vm.style = '';
    vm.prematureFinish = false;
    vm.save = save;
    vm.ignore = ignore;
    vm.previous = previous;

    next();

    ////////////

    function next() {

      vm.currentQuestion = Status.getQuestion();

      if (vm.currentQuestion.percent >= 99 || vm.currentQuestion.text===undefined) {
        $state.go('result');
      }
    }

    function ignore() {
      vm.currentQuestion.reply = CONSTANTS.KEYWORD_DISCARD;
      save();

    }

    function previous() {
      vm.currentQuestion = Status.getPreviousQuestion(vm.currentQuestion.attr);
    }

    function save() {

      $timeout(function() {

        if (vm.currentQuestion.reply !==CONSTANTS.KEYWORD_DISCARD || !vm.currentQuestion.reply) {
          Status.put(vm.currentQuestion.attr, vm.currentQuestion.reply);
        }

        vm.style = 'animated bounceInRight';
        vm.prematureFinish = (CONSTANTS.MIN_PERCENT_VALID<=vm.currentQuestion.percent);
        next();

      }, CONSTANTS.AUTOSEND_SECONDS);

      vm.style = 'animated bounceOutLeft';

    }

  }

  ResultController.$inject = ['Status','Utils','$state'];
  function ResultController(Status, Utils, $state) {

    var vm = this;
    vm.reset = reset;
    vm.Utils = Utils;
    vm.input = {};
    vm.prediction = {};
    vm.alternatives = [];

    this.goToLink = function (url) {
      window.open(url,'_system');
    };

    Status.predict().then(function(res) {
      var games = _.map(res, function(n) { return Status.getGame(n); },vm);
      vm.alternatives = vm.Utils.lodash.flatten(games);

    });

    ////////////

    function reset() {
      Status.clear();
      $state.go('home');
    }
  }

  AdminController.$inject = ['Status','Utils','$state'];
  function AdminController(Status, Utils, $state) {

    // debugger;

    var vm = this;
    vm.responses = {};
    vm.questions = Status.getAllQuestions();
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
