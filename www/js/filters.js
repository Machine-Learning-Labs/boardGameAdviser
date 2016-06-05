'use strict';

angular
  .module('boardGameAdviser')
  .filter('labelize',labelize);

/*
 question.currentQuestion = question
 question.currentQuestion.reply = value

 */

labelize.$inject = ['Utils'];
function labelize(Utils) {

  return function(question, value) {

    var reply = Utils.lodash.find(question.replies,{value:value}).label;

    console.log(question)
    console.log(value)
    console.log(reply);

    return reply;
  };
}
