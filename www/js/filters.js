(function() {
  'use strict';

  angular
    .module('boardGameAdviser')
    .filter('labelize',labelize)
    .filter('youtubize',youtubize)
    .filter('imageUrilize',imageUrilize);

  youtubize.$inject = ['CONSTANTS', '$sce'];
  function youtubize(CONSTANTS, $sce) {

    return function(value) {
      var url = CONSTANTS.YOUTUBE_URL + value + '?rel=0&hd=1';
      return $sce.trustAsResourceUrl(url);
    };
  }

  imageUrilize.$inject = ['CONSTANTS'];
  function imageUrilize(CONSTANTS) {

    return function(value) {
      return CONSTANTS.URL_IMAGES + value + '.jpg';
    };
  }

  labelize.$inject = ['Utils'];
  function labelize(Utils) {

    return function(question, value) {
      var reply = Utils.lodash.find(question.replies,{value:value}).label;
      return reply;
    };
  }

})();
