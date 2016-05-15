angular
  .module('boardGameAdviser')
  .factory('Utils', Utils)
  .service('Status', Status)
  .factory('$exceptionHandler', Errors );

Errors.$inject = ['$window'];
function Errors ($window) {

  return function(exception, cause) {

    $window.location.href = '/';
    //$injector.get('$state').go('home');
    //throw exception;
  };
}

function Utils() {

  var jmespath = window.jmespath;
  var lodash = window._;

  var dt = window.dt;
  return {
    jmespath: jmespath,
    lodash: lodash,
    dt:dt
  };
}

// Public API here
Status.$inject = ['CONSTANTS', 'Utils', '$http', '$timeout', '$q'];
function Status(CONSTANTS, Utils, $http, $timeout, $q) {

  // Algorythm Results
  var responses = {};
  var knowledge = {
    data: {},
    keys: []
  };

  // IA Setup Vars
  var decisionTree = {};
  var randomForest = {};
  var numberOfTrees = CONSTANTS.NUMBER_OF_TREES;
  var iaConfig = {
    trainingSet : [],
    categoryAttr: 'id',
    ignoredAttributes: CONSTANTS.ATTR_TO_IGNORE
  };

  // Public API here
  var service = {
    start: start,
    getGame: getGame,
    getQuestion: getQuestion,
    predict: predict,
    put: put,
    clear: clear,
    responses : getResponses
  };

  return service;

  ////////////

  function start() {

      return getTrainingSet().then(function(data) {

        knowledge = data;
        knowledge.keys = _.keys(data.questions);
        iaConfig.trainingSet = data.training;

        loadIA();

        return knowledge.keys.length;
      });

  }

  function getTrainingSet() {

    var defer = $q.defer();

    var callback = function(err,data) {
      if (err)  { defer.reject(response); }
      else      { defer.resolve(data); }
    };

    if (navigator.onLine) {

      getData(CONSTANTS.URL_REMOTE_TRAINING_SET)
        .then(function successCallback(response) { callback(null, response.data); },
              function errorCallback(response)   {
                getData(CONSTANTS.URL_LOCAL_TRAINING_SET)
                  .then(function successCallback(response) { callback(null, response.data); },
                    function errorCallback(response) { ionic.Platform.exitApp(); });
              });

    } else {

      getData(CONSTANTS.URL_LOCAL_TRAINING_SET)
        .then(function successCallback(response) { callback(null, response.data); },
          function errorCallback(response) { ionic.Platform.exitApp(); });
    }

    return defer.promise;
  }

  function getData(url) {

    return $http({
      method: 'GET',
      url: url
    });
  }

  function loadIA() {

    // Building Decision Tree
    decisionTree = new Utils.dt.DecisionTree(iaConfig);

    // Building Random Forest
    randomForest = new Utils.dt.RandomForest(iaConfig, numberOfTrees);
  }

  function predict() {

    var defer = $q.defer();

    // Testing Decision Tree and Random Forest
    $timeout(function() {

      var games = [];
        games.push(decisionTree.predict(responses));
        games =Utils.lodash.merge(games, Utils.lodash.keys(randomForest.predict(responses)));

      Utils.lodash.uniq(games);
      defer.resolve(games);

    }, CONSTANTS.AUTOSEND_SECONDS);

    return defer.promise;
  }

  function getGame(id) {
    return Utils.jmespath.search(knowledge,"training[?id=='"+id+"']");
  }

  function getQuestion() {

    var position = "minjugadores";
    var options = Utils.lodash.keys(knowledge.questions);
    var previous = Utils.lodash.keys(responses);

    switch(previous.length) {
      case 0: position = "minjugadores"; break;
      case 1: position = "maxjugadores"; break;
      case 2: position = "minedad"; break;
      default: position = Utils.lodash.sample(Utils.lodash.difference(options,previous));
    }

    var candidate = candidate = knowledge.questions[position];

    var reply = {};
      reply = Utils.lodash.merge(reply,candidate);
      reply.attr = position;
      reply.percent = parseInt((previous.length * 100) / options.length);

    return reply;
  }

  function getResponses() {
    return _.clone(responses);
  }

  function put(key,val) {

    responses[key] = val;
    return responses.key == val;
  }

  function clear () {
    responses = null;
    responses = {};
    return _.isNull(responses);
  }

}
