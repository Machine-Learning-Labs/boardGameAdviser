(function() {
  'use strict';

  angular
    .module('boardGameAdviser')
    .controller('barController', barController)
    .controller('HomeController', HomeController)
    .controller('QuestionController', QuestionController)
    .controller('ResultController', ResultController);

  barController.$inject = ['$state'];
  function barController($state) {

    var vm = this;
      vm.secret = secret;

    ////////////

    function secret() {
      $state.go('home');
    }

  }

  HomeController.$inject = ['Data', '$state'];
  function HomeController(Data, $state) {

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

    Logic.predict(CONSTANTS.DEFAULT_ENGINE)
      .then(function(res) { vm.alternatives = res; })
      .catch(function(err) {
        $state.go('home');
      });

    ////////////

    function goToLink(url) {

      var remote_url = CONSTANTS.URL_GAMES + url;
      window.open(remote_url,'_system');
    }

    function reset() {
      Data.clear();
      $state.go('home');
    }
  }

})();
