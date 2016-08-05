(function() {
  'use strict';

  angular
    .module('boardGameAdviser')
    .factory('Persistence', Persistence)
    .factory('Data', Data)
    .factory('Logic', Logic)
    .factory('Utils', Utils)
    .factory('$exceptionHandler', Errors );

  // Persistence ///////////////////////////////////////////////////////////////////////////////////////////////////////
  Persistence.$inject = ['CONSTANTS', '$q', 'Loki'];
  function Persistence(CONSTANTS, $q, Loki) {

    var _db;
    var _games;

    return {
      initDB: initDB,
      getAllGamesSaved: getAllGamesSaved,
      saveGame: saveGame,
      eraseGame: eraseGame
    };

    /////////////

    /**
     * Initialize the db engine
     */
    function initDB() {

      var fsAdapter = new LokiCordovaFSAdapter(CONSTANTS.DB.PREFIX);

      // TODO free the adapter on mobile or build
      _db = new Loki(
        CONSTANTS.DB.DB_NAME,
        {
          autosave: CONSTANTS.DB.AUTOSAVE,
          autosaveInterval: CONSTANTS.DB.INTERVAL,
          //adapter: fsAdapter
        });

      return getAllGamesSaved();
    }

    /**
     * Save a game
     * @param game
     */
    function saveGame(game) {
      _games.insert(game);
    }

    /**
     * Delete a game
     * @param game
     */
    function eraseGame(game) {
      _games.remove(game);
    }

    /**
     * Return all the save games
     * @returns {*}
     */
    function getAllGamesSaved() {

      return $q(function (resolve, reject) {

        var options = {
          games: {
            proto: Object,
            inflate: function (src, dst) {
              var prop;
              for (prop in src) {
                if (prop === 'Date') { dst.Date = new Date(src.Date); }
                else { dst[prop] = src[prop]; }
              }
            }
          }
        };

        _db.loadDatabase(options, function () {

          _games = _db.getCollection(CONSTANTS.DB.DB_NAME);

          if (!_games) { _games = _db.addCollection(CONSTANTS.DB.DB_NAME); }

          resolve(_games.data);
        });
      });
    }

  }

  // Data //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  Data.$inject = ['CONSTANTS', 'Utils', '$http', '$q'];
  function Data(CONSTANTS, Utils, $http, $q) {

    var _weigth = {};
    var _knowledge = {};
    var _questions = {};
    var _responses = {};
    var _blacklist = [];
    var KEYWORD_DISCARD =  CONSTANTS.KEYWORD_DISCARD;

    return {
      start: start,
      put:put,
      clear:clear,
      setBlackList: setBlackList,
      getGame:getGame,
      getGames:getGames,
      getWeigths: getWeigths,
      getResponses:getResponses,
      getTrainingSet: getTrainingSet,
      getPreviousQuestion:getPreviousQuestion,
      getQuestion:getQuestion
    }

    ////////////

    /**
     * Bootstrap the data capture
     * @returns {Promise}
     */
    function start() {

      var defer = $q.defer();

      loadTrainingSet().then(function(data) {
        _weigth = data.weigth;
        _knowledge = data.training;
        _questions = data.questions;

        defer.resolve(data.training.length);

      },function(err) {
        defer.reject(0);
      });

      // TODO qAll -> Load old games

      return defer.promise;
    }

    /**
     * Get the tragining dataset
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
     * Returns a copy of games that satisfy the three rules by orders (minPlayer, minAge, maxPlayer)
     * @returns {*}
     */
    function getTrainingSet() {

      var reply = [];
      var responsesCached = getResponses();
      var gamesFiltered = _.filter(_knowledge, function(game) {
        return !_.includes(_blacklist, game.id)
      })

      var minAgeFilter = "[?minedad=='"+Utils._.get(responsesCached, 'minedad')+"']";
      var minPlayersFilter = "[?minjugadores=='"+Utils._.get(responsesCached, 'minjugadores')+"']";
      var maxPlayersFilter = "[?maxjugadores<=`"+Utils._.get(responsesCached, 'maxjugadores')+"`]";

      //jmespath.search(gamesFiltered,"[?minedad=='6'] \| [?minjugadores=='2'] \| [?maxjugadores<=`5`]")
      var opt1 = jmespath.search(gamesFiltered, minAgeFilter + " \| " + minPlayersFilter + " \| " + maxPlayersFilter);
      var opt2 = jmespath.search(gamesFiltered, minAgeFilter + " \| " + minPlayersFilter);
      var opt3 = jmespath.search(gamesFiltered, minAgeFilter);

      if (opt1.length>=CONSTANTS.MAX_NUMBER_OF_SOLUTIONS)       { reply = opt1; }
      else if (opt2.length>=CONSTANTS.MAX_NUMBER_OF_SOLUTIONS)  { reply = opt2; }
      else if (opt3.length>=CONSTANTS.MAX_NUMBER_OF_SOLUTIONS)  { reply = opt3; }
      else                                                      { reply = Utils._.clone(_knowledge); }

      //console.log('filtros: minEdad + minJugadores + maxJugadores: ' + opt1.length)
      //console.log('filtros: minEdad y minJugadores dan: ' + opt2.length)
      //console.log('filtro: minEdad dan: ' + opt3.length)

      return reply;
    }

    /**
     * Set the BlackList property
     * @param list
     * @returns {boolean}
     */
    function setBlackList(list) {

      _blacklist = Utils._.map(list,"id");
      return _blacklist === list;
    }

    /**
     * Save a response by a pair key val
     * @param key
     * @param val
     * @returns {boolean}
     */
    function put(key,val) {

      _responses[key] = val;
      return _responses.key === val;
    }

    /**
     * Cleans all the responses
     * @returns {boolean}
     */
    function clear() {

      _responses = null;
      _responses = {};
      return _.isNull(_responses);
    }

    /**
     * Returns a clean copy of responses with discard values filtered
     * @returns {*}
     */
    function getResponses() {

      var reply = Utils._.clone(_responses);
      return Utils._.pickBy(reply, function(value, key) { return value!==KEYWORD_DISCARD });
    }

    /**
     * Returns a clean copy of weigths
     * @returns {*}
     */
    function getWeigths() {
      return Utils._.clone(_weigth);
    }

    /**
     * Get the data from a game
     * @param id
     * @returns {*}
     */
    function getGame(id) {
      return Utils.jmespath.search(_knowledge,"[?id=='"+id+"']");
    }

    /**
     * Returns a clean copy of games
     * @returns {*}
     */
    function getGames() {

      var allGames = Utils._.clone(_knowledge);

      return Utils._.map(allGames,function(item) { return {id:item.id,name:item.name}; });
    }

    /**
     * Get a new unAnswered question
     * @returns {{}}
     */
    function getQuestion() {

      var position = "minjugadores";
      var options = Utils._.keys(_questions);
      var previous = Utils._.keys(_responses);

      switch(previous.length) {
        case 0: position = "minjugadores"; break;
        case 1: position = "maxjugadores"; break;
        case 2: position = "minedad"; break;
        default: position = Utils._.sample(Utils._.difference(options,previous));
      }

      var candidate = _questions[position];

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

  // Logic /////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

        // Gather the data
        var responses = Data.getResponses();

        // Predict
        if (Utils._.keys(responses).length<=0) {
          return defer.reject('Not enought responses given');
        }

        switch (engine) {
          case "id3": ids = id3_predict(responses); break;
          case "randomForest": ids = randomForest_predict(responses); break;
          case "kdTree":
          default: ids = kdTree_predict(responses); break;
        }

        // Filter
        games = Utils._.flatten(Utils._.map(ids, function(n) { return Data.getGame(n); }));
        defer.resolve(games);

      }, CONSTANTS.AUTOSEND_SECONDS);

      return defer.promise;
    }

    /**
     * Recommend one game using ID3 Decision Tree Algorithm
     * @param responses
     * @returns [{game:id}]
     */
    function id3_predict(responses) {

      // Building Decision Tree
      var iaConfig = {
        categoryAttr: 'id',
        trainingSet : Data.getTrainingSet(),
        ignoredAttributes: CONSTANTS.ATTR_TO_IGNORE
      };

      var decisionTree = new Utils.dt.DecisionTree(iaConfig);
      var conclusion = [decisionTree.predict(responses)];
      return conclusion;
    }

    /**
     * Recommend one game using RandomForest Algorithm
     * @param responses
     * @returns [{game:id}]
     */
    function randomForest_predict(responses) {

      // Building Random Forest
      var iaConfig = {
        categoryAttr: 'id',
        trainingSet : Data.getTrainingSet(),
        ignoredAttributes: CONSTANTS.ATTR_TO_IGNORE
      };

      var randomForest = new Utils.dt.RandomForest(iaConfig, CONSTANTS.MAX_NUMBER_OF_SOLUTIONS);
      var conclusion = randomForest.predict(responses);
      return Utils._.keys(conclusion);
    }

    /**
     * Recommend one game using KdTree Algorithm
     * @param responses
     * @returns [{game:id}]
     */
    function kdTree_predict(responses) {

      var training = Data.getTrainingSet();
      var weigths = Data.getWeigths();

      var attrs = Utils._.difference(Utils._.keys(responses), CONSTANTS.ATTR_TO_IGNORE);
      var similarity = function (a,b) {

        var distance = 0;

        Utils._.forEach(a, function(value,key) {

          if (Utils._.includes(CONSTANTS.ATTR_TO_IGNORE,key))
            return;

          try {

            // String comparison based on position (turns on position based)
            if (typeof(a[key])==='string') {
              var aStringified = _.indexOf(CONSTANTS.STRING_ATTR_MAP[key], a[key]);
              var bStringified = _.indexOf(CONSTANTS.STRING_ATTR_MAP[key], b[key]);
              distance += Math.abs( aStringified - bStringified ) * weigths[key];

            // Numeric Euclidean Comparison
            } else {
              distance += Math.abs( a[key] - b[key] ) * weigths[key];
            }

          } catch(err) {
            distance += weigths[key] || 0;
          }

        });

        return distance;
      };

      var tree = new Utils.kdTree(training, similarity, attrs);
      var conclusion = tree.nearest(responses, CONSTANTS.MAX_NUMBER_OF_SOLUTIONS);

      console.log(tree.balanceFactor());

      var Games = Utils._.map(Utils._.sortBy(conclusion,1),0);
      Games = Utils._.map(Games,'id');

      return Games;

    }

  }

  // Utils  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
