(function() {
  'use strict';


angular
  .module('boardGameAdviser')
  .factory('Utils', Utils)
  .service('Status', Status)
  .factory('$exceptionHandler', Errors );

Errors.$inject = ['$window'];
function Errors ($window) {

  return function(exception, cause) {

    console.log('error ****************');
    console.log(exception);
    console.log(cause);

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
    getPreviousQuestion: getPreviousQuestion,
    getAllQuestions: getAllQuestions,
    predict: predict,
    put: put,
    clear: clear,
    responses : getResponses
  };

  return service;

  ////////////

  /**
   * Bootstrap the IA
   *
   * @returns {*}
   */
  function start() {

      return getTrainingSet().then(function(data) {

        knowledge = data;
        knowledge.keys = _.keys(data.questions);
        iaConfig.trainingSet = data.training;

        loadIA();

        return knowledge.keys.length;
      });

  }

  /**
   * Get the tragining dataset
   *
   * @returns {r.promise|k.promise|{then, catch, finally}|promise|*|Promise}
   */
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

  /**
   * Initializes the IA
   */
  function loadIA() {

    // Building Decision Tree
    decisionTree = new Utils.dt.DecisionTree(iaConfig);

    // Building Random Forest
    randomForest = new Utils.dt.RandomForest(iaConfig, numberOfTrees);
  }

  /**
   * Give a prediction from responses
   * @returns {r.promise|promise|*|k.promise|{then, catch, finally}|Promise}
   */
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

  /**
   * $http get wrapper
   *
   * @param url
   * @returns {*}
   */
  function getData(url) {

    return $http({
      method: 'GET',
      url: url
    });
  }

  /**
   * Return all questions with candidate values instead labels
   * @returns {Object}
   */
  function getAllQuestions() {

    return _.mapValues(knowledge.questions,function(value, key) { return _.map(value.replies, 'value'); });
  }

  /**
   * Get a new unAnswered question
   *
   * @returns {{}}
   */
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

    var candidate = knowledge.questions[position];

    var reply = {};
      reply = Utils.lodash.merge(reply,candidate);
      reply.attr = position;
      reply.percent = parseInt((previous.length * 100) / options.length);

    return reply;
  }


  /**
   * Locate and returns a question before some pointer
   * @param reference
   * @returns {{}}
   */
  function getPreviousQuestion(reference) {

    // TODO -> return another game
    var reply = {};
    reply = Utils.lodash.merge(reply,candidate);
    reply.attr = position;
    reply.percent = parseInt((previous.length * 100) / options.length);

    return reply;

  }

  /**
   * Returns a clean copy of responses
   * @returns {*}
   */
  function getResponses() {
    return _.clone(responses);
  }

  /**
   * Save a response by a pair key val
   *
   * @param key
   * @param val
   * @returns {boolean}
     */
  function put(key,val) {

    responses[key] = val;
    return responses.key == val;
  }

  /**
   * Cleans all the responses
   *
   * @returns {boolean}
   */
  function clear() {
    responses = null;
    responses = {};
    return _.isNull(responses);
  }

  /**
   * Get the data from a game
   *
   * @param id
   * @returns {*}
   */
  function getGame(id) {
    return Utils.jmespath.search(knowledge,"training[?id=='"+id+"']");
  }

}

})();
