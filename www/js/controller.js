

/* recommended */
angular
  .module('boardGameAdviser')
  .controller('HomeController', HomeController)
  .controller('QuestionController', QuestionController)
  .controller('ResultController', ResultController);


HomeController.$inject = ['Status', '$state'];
function HomeController(Status, $state) {

  var vm = this;
  vm.ready = false;
  vm.textButton = "Adelante";
  vm.start = start;

  Status.start()
    .then(function(res) {
      vm.ready = true;
    })
    .catch(function(res) {
      vm.ready = false;
      vm.textButton = "Intentar de nuevo más tarde";
    });

  ////////////

  function start() {
    $state.go('questions');
  }

}

QuestionController.$inject = ['CONSTANTS', 'Status', '$timeout'];
function QuestionController(CONSTANTS, Status, $timeout) {

  var vm = this;
    vm.style = '';
    vm.prematureFinish = false;
    vm.save = save;
    vm.resolve = resolve;

  next();

  ////////////

  function next() {
    vm.currentQuestion = Status.getQuestion();
  }

  function resolve() {

  }

  function save() {

    $timeout(function() {
      
      Status.put(vm.currentQuestion.attr, vm.currentQuestion.reply);
      next();
      vm.style = 'animated bounceInRight';
      vm.prematureFinish = (CONSTANTS.MIN_PERCENT_VALID<=vm.currentQuestion.percent);

    }, CONSTANTS.AUTOSEND_SECONDS);

    vm.style = 'animated bounceOutLeft';

  }

}

ResultController.$inject = ['Status'];
function ResultController(Status) {
  var vm = this;

}
