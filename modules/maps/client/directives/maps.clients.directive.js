'use strict';

angular.module('maps')
    .directive('tmplMap', directiveMap);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Map
//
// -----------------------------------------------------------------------------------
function directiveMap() {

    var directive = {
        restrict: 'E',
        replace: true,
        templateUrl: 'modules/maps/client/views/partials/map-layers.html',
        scope: {
            project: '=',
        	layers: '='
        },
        controller: 'controllerMap',
        controllerAs: 'mpl'
    };

    return directive;
}
