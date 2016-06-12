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

  HomeController.$inject = ['Data', '$state', '$ionicLoading'];
  function HomeController(Data, $state, $ionicLoading) {

    var vm = this;
      vm.ready = true;
      vm.textButton = "Adelante";
      vm.run = run;


    Data.clear();

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

  ResultController.$inject = ['CONSTANTS', 'Data', 'Logic','$state'];
  function ResultController(CONSTANTS, Data, Logic, $state) {

    var vm = this;
    vm.input = {};
    vm.prediction = {};
    vm.alternatives = [];

    vm.reset = reset;
    vm.goToLink = goToLink;

    Logic.predict(CONSTANTS.DEFAULT_ENGINE).then(function(res) {
      vm.alternatives = res;
    });

    ////////////

    function goToLink(url) {
      window.open(url,'_system');
    }

    function reset() {
      Data.clear();
      $state.go('home');
    }
  }

  AdminController.$inject = ['Data', 'Logic', '$ionicLoading'];
  function AdminController(Data, Logic, $ionicLoading) {

    var vm = this;
    vm.choice = 'kdTree';
    vm.alternatives = [];
    vm.responses = {};
    vm.questions = {
      ranges: [],
      combos: []
    };

    vm.think = think;
    vm.clear = clear;

    // Manual data bootstrap
    Data.start()
      .then(function(res) {
        $ionicLoading.hide();
        init(Data.getAllQuestions());
      })
      .catch(function(res) {
        $ionicLoading.hide();
      });

    ////////////

    function init(data) {

      debugger

      //vm.responses = ;
      vm.questions.priority = {
        "minedad": data['minedad'],
        "minjugadores": data['minjugadores'],
        "maxjugadores": data['maxjugadores'],
      }

      vm.questions.ranges = data;
      vm.questions.combos = data;

    }

    function think(engine) {

      Logic.predict(engine).then(function(res) {
        vm.alternatives = res;
      });

    }

    function clear() {
      Data.clear();
      vm.responses = {};
      vm.alternatives = [];
    }
  }

})();
