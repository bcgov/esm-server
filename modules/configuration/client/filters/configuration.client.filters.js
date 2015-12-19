'use strict';

angular.module('configuration')
    .filter('resolveProjectItemNameById', filterResolveProjectItemNameById);

// -----------------------------------------------------------------------------------
//
// FILTER: Resovle an ID to an item name within a stream
//
// -----------------------------------------------------------------------------------
filterResolveProjectItemNameById.$inject = ['_'];
/* @ngInject */
function filterResolveProjectItemNameById(_) {
    return function(input, data) {
        var output = '';
        if (data) {
            if (data.length) {
                _.each(data, function(item) {
                    if (item._id === input) {
                        output = item.name;
                    }
                });
            } else {
                if (data._id === input) {
                    output = data.name;
                }
            }
        }
        return output;
    };
}

