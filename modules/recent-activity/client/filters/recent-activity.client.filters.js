'use strict';

angular.module('recent-activity')
    .filter('limitHTML', filterLimitHTML);
   
// -----------------------------------------------------------------------------------
//
// FILTER: Limit HTML
//
// -----------------------------------------------------------------------------------
filterLimitHTML.$inject = ['_'];
/* @ngInject */
function filterLimitHTML(_) {
    return function(text, limit) {
        
        return text;
        // text = text.replace(/\u00a0/g, " ");
        // var changedString = String(text).replace(/<[^>]+>/gm, '');
        // var length = changedString.length;
        // return changedString.length > limit ? changedString.substr(0, limit - 1) : changedString; 
    };
}
