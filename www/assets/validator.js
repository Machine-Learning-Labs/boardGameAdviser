/*

 */

var jmespath = require('jmespath');
var _ = require('lodash');

var knowledge = {};
var omitibleData = ['id','description','name','prize','url'];

// Obtaining reachable values through questions
var maps = _.mapValues(knowledge.questions, function(value, key) {
  return _.map(value.replies, 'value');
});

// Obtaining games with unreachable data
var problems = _.reject(knowledge.training, function(game) {

  var corrected = true;

  _.each(game,function(value, key) {
    if (!_.includes(omitibleData,key)) {

      if (!_.includes(maps[key], value)) {
        corrected = false;
        console.log('* ' + game.name + ' key? ' + key + ' no puede valer: ' + value + ' debe estar en: ' + JSON.stringify(maps[key]))
      }
    }
  })

  return corrected;
});


// Generating table of ages

// Generating stats of questions

// Generating stats of games
