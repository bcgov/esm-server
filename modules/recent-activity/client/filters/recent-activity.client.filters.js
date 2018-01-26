'use strict';

angular.module('recent-activity')
  .filter('limitHTML', filterLimitHTML);

// -----------------------------------------------------------------------------------
//
// FILTER: Limit HTML
//
// -----------------------------------------------------------------------------------
function filterLimitHTML() {
  return function(text) {
    return text;
  };
}
