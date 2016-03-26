angular
  .module('boardGameAdviser')
  .factory('Utils', Utils)
  .service('Status', Status);

function Utils () {

  var jmespath = window.jmespath;
  var lodash = window._;
  var dt = window.dt;

  // Public API here
  return {
    jmespath: jmespath,
    lodash: lodash,
    dt:dt
  };
}

Status.$inject = ['CONSTANTS', 'Utils', '$http', '$q'];
function Status(CONSTANTS, Utils, $http, $q) {

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
    ignoredAttributes: ['id','name','prize','url']
  };

  // Public API here
  var service = {
    start: start,
    getQuestion: getQuestion,
    predict: predict,
    put: put,
    clear: clear
  };

  return service;

  ////////////

  function start() {

      return getTrainingSet().then(function(data) {

        knowledge = data;
        knowledge.keys = _.keys(data.questions);
        iaConfig.trainingSet = data;

        loadIA();

        return knowledge.keys.length;
      });

  }

  function getTrainingSet() {

    var defer = $q.defer();

    var local;
    var remote;

    $http({
      method: 'GET',
      //url: 'http://www.mordorgames.es/datos/dataSet.json'
      url: 'https://api.twitter.com/1.1/trends/available.json'
    })
      .then(function successCallback(response) {
        defer.resolve(response.data);

      }, function errorCallback(response) {

        $http({
          method: 'GET',
          url: './assets/default.json'
        }).then(function successCallback(response) {
          defer.resolve(response.data);

        }, function errorCallback(response) {
          console.log('todo ha ido mal :(');
          defer.reject(response);
        });
      });

    return defer.promise;
  }

  function loadIA() {

    // Building Decision Tree
    decisionTree = new Utils.dt.DecisionTree(iaConfig);

    // Building Random Forest
    randomForest = new Utils.dt.RandomForest(iaConfig, numberOfTrees);
  }

  function predict() {

    // Testing Decision Tree and Random Forest
    var decisionTreePrediction = decisionTree.predict(responses);
    var randomForestPrediction = randomForest.predict(responses);

    console.log(decisionTreePrediction);
    console.log(randomForestPrediction);

    return {
      decisionTreePrediction : decisionTreePrediction,
      randomForestPrediction : randomForestPrediction
    }

  }

  function getQuestion() {

    var reply = {};

    var previous = Utils.lodash.keys(responses);
    var options = Utils.lodash.keys(knowledge.questions);
    var position = Utils.lodash.head(Utils.lodash.difference(options,previous));
    var candidate = knowledge.questions[position];

    if (Utils.lodash.isArray(candidate)) {
      candidate = Utils.lodash.sample(candidate);
    }

    reply = Utils.lodash.merge(reply,candidate);
    reply.attr = position;
    reply.percent = parseInt((previous.length * 100) / options.length);

    return reply;
  }

  function put(key,val) {

    responses[key] = val;
    return responses.key == val;
  }

  function clear () {
    responses = {};
  }

}
