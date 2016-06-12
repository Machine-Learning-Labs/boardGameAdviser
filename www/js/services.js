(function() {
  'use strict';

  angular
    .module('boardGameAdviser')
    .factory('Data', Data)
    .factory('Logic', Logic)
    .factory('Utils', Utils)
    .factory('$exceptionHandler', Errors );


  Data.$inject = ['CONSTANTS', 'Utils', '$http', '$q'];
  function Data(CONSTANTS, Utils, $http, $q) {

    var weigth = {};
    var knowledge = {};
    var questions = {};
    var responses = {};

    var service = {
      start: start,
      put:put,
      clear:clear,
      getGame:getGame,
      getWeigths: getWeigths,
      getResponses:getResponses,
      getTrainingSet: getTrainingSet,
      getAllQuestions:getAllQuestions,
      getPreviousQuestion:getPreviousQuestion,
      getQuestion:getQuestion
    };

    return service;

    ////////////

    /**
     * Bootstrap the data capture
     *
     * @returns {Promise}
     */
    function start() {

      var defer = $q.defer();

      loadTrainingSet().then(function(data) {
        weigth = data.weigth;
        knowledge = data.training;
        questions = data.questions;

        defer.resolve(data.training.length);

      },function(err) {
        defer.reject(0);
      });

      return defer.promise;
    }

    /**
     * Get the tragining dataset
     *
     * @returns Promise
     */
    function loadTrainingSet() {

      var defer = $q.defer();
      var successCallback = function(response) { defer.resolve(response.data); };
      var errorCallback = function(err) { defer.reject(err); };

      if (navigator.onLine) {

        getData(CONSTANTS.URL_REMOTE_TRAINING_SET)
          .then(successCallback,
            function errorCallback(response) {
              getData(CONSTANTS.URL_LOCAL_TRAINING_SET)
                .then(successCallback,  errorCallback);
            });

      } else {

        getData(CONSTANTS.URL_LOCAL_TRAINING_SET)
          .then(successCallback,  errorCallback);
      }

      return defer.promise;
    }

    /**
     * $http get wrapper
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
     * Returns a clean copy of responses
     * @returns {*}
     */
    function getResponses() {
      return Utils._.clone(responses);
    }

    /**
     * Returns a clean copy of weigths
     * @returns {*}
     */
    function getWeigths() {
      return Utils._.clone(weigth);
    }


    /**
     * Returns a copy of games that satisfy the three rules by orders (minPlayer, minAge, maxPlayer)
     * @returns {*}
     */
    function getTrainingSet() {

      var reply = [];
      var minAgeFilter = "[?minedad=='"+Utils._.get(getResponses(), 'minedad')+"']";
      var minPlayersFilter = "[?minjugadores=='"+Utils._.get(getResponses(), 'minjugadores')+"']";
      var maxPlayersFilter = "[?maxjugadores=='"+Utils._.get(getResponses(), 'maxjugadores')+"']";

      var opt1 = jmespath.search(knowledge, minPlayersFilter + " \| " + minAgeFilter + " \| " + maxPlayersFilter);
      var opt2 = jmespath.search(knowledge, minPlayersFilter + " \| " + minAgeFilter);
      var opt3 = jmespath.search(knowledge, minPlayersFilter);

      if (opt1.length>0)      { reply = opt1; }
      else if (opt2.length>0) { reply = opt2; }
      else if (opt3.length>0) { reply = opt3; }
      else                    { reply = Utils._.clone(knowledge); }

      return reply;
    }

    /**
     * Save a response by a pair key val
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
     * @returns {boolean}
     */
    function clear() {
      responses = null;
      responses = {};
      return _.isNull(responses);
    }

    /**
     * Get the data from a game
     * @param id
     * @returns {*}
     */
    function getGame(id) {
      return Utils.jmespath.search(knowledge,"[?id=='"+id+"']");
    }

    /**
     * Return all questions with candidate values instead labels
     * @returns {Object}
     */
    function getAllQuestions() {
      return _.mapValues(questions,function(value, key) { return _.map(value.replies, 'value'); });
    }

    /**
     * Get a new unAnswered question
     * @returns {{}}
     */
    function getQuestion() {

      var position = "minjugadores";
      var options = Utils._.keys(questions);
      var previous = Utils._.keys(responses);

      switch(previous.length) {
        case 0: position = "minjugadores"; break;
        case 1: position = "maxjugadores"; break;
        case 2: position = "minedad"; break;
        default: position = Utils._.sample(Utils._.difference(options,previous));
      }

      var candidate = questions[position];

      var reply = {};
      reply = Utils._.merge(reply,candidate);
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
      reply = Utils._.merge(reply,candidate);
      reply.attr = position;
      reply.percent = parseInt((previous.length * 100) / options.length);

      return reply;

    }

  }

  Logic.$inject = ['CONSTANTS', 'Data', 'Utils', '$q', '$timeout'];
  function Logic(CONSTANTS, Data, Utils, $q, $timeout) {

    return {
      predict: predict
    };

    ////////////

    /**
     * Give a prediction from responses using different algorithms
     *
     * @param engine
     * @returns {Promise}
     */
    function predict(engine) {

      var defer = $q.defer();

      // Testing Decision Tree and Random Forest
      $timeout(function() {

        var ids = [];
        var games = [];

        // Predict
        switch (engine) {
          case "id3": ids = id3_predict(); break;
          case "randomForest": ids = randomForest_predict(); break;
          case "kdTree":
          default: ids = kdTree_predict(); break;
        }

        // Filter
        games = Utils._.flatten(Utils._.map(ids, function(n) { return Data.getGame(n); }));
        defer.resolve(games);

      }, CONSTANTS.AUTOSEND_SECONDS);

      return defer.promise;
    }

    /**
     * Recommend one game using ID3 Decision Tree Algorithm
     * @returns [{game:id}]
     */
    function id3_predict() {

      // Building Decision Tree
      var iaConfig = {
        categoryAttr: 'id',
        trainingSet : Data.getTrainingSet(),
        ignoredAttributes: CONSTANTS.ATTR_TO_IGNORE
      };

      var decisionTree = new Utils.dt.DecisionTree(iaConfig);
      var conclusion = [decisionTree.predict(Data.getResponses())];
      return conclusion;
    }

    /**
     * Recommend one game using RandomForest Algorithm
     * @returns [{game:id}]
     */
    function randomForest_predict() {

      // Building Random Forest
      var iaConfig = {
        categoryAttr: 'id',
        trainingSet : Data.getTrainingSet(),
        ignoredAttributes: CONSTANTS.ATTR_TO_IGNORE
      };

      var randomForest = new Utils.dt.RandomForest(iaConfig, CONSTANTS.MAX_NUMBER_OF_SOLUTIONS);
      var conclusion = randomForest.predict(Data.getResponses());
      return Utils._.keys(conclusion);
    }

    /**
     * Recommend one game using KdTree Algorithm
     * @returns [{game:id}]
     */
    function kdTree_predict() {

      var responses = Data.getResponses();
      var training = Data.getTrainingSet();
      var weigths = Data.getWeigths();

      var attrs = Utils._.difference(Utils._.keys(responses), CONSTANTS.ATTR_TO_IGNORE);
      var similarity = function (a,b) {

        var distance = 0;

        Utils._.forEach(a, function(value,key) {

          try {
            if (typeof(a[key])==='string') {

              var aStringified = _.indexOf(CONSTANTS.STRING_ATTR_MAP[key], a[key]);
              var bStringified = _.indexOf(CONSTANTS.STRING_ATTR_MAP[key], b[key]);
              distance += Math.abs( aStringified - bStringified ) * weigths[key];
            } else {
              distance += Math.abs( a[key] - b[key] ) * weigths[key];
            }
          } catch(err) {
            distance += weigths[key];
          }

        });

        return distance;
      };


      var tree = new Utils.kdTree(training, similarity, attrs);
      var conclusion = tree.nearest(responses, CONSTANTS.MAX_NUMBER_OF_SOLUTIONS);

      var Games = Utils._.map(Utils._.sortBy(conclusion,1),0);
      Games = Utils._.map(Games,'id');

      return Games;

    }

  }

  Utils.$inject = ['$log'];
  function Utils($log) {

    $log.info('Loading Vendors');

    return {
      _: window._,
      jmespath: window.jmespath,
      dt:window.dt,
      kdTree: window.kdTree,
      BinaryHeap: window.BinaryHeap
    };
  }

  Errors.$inject = ['$window','$log'];
  function Errors ($window, $log) {

    return function(exception, cause) {

      $log.error(exception)
      $log.error(cause)

      $window.location.href = '/';
    };
  }

})();
