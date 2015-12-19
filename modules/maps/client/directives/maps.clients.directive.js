'use strict';

angular.module('maps')
    .directive('tmplMap', directiveMap);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Document Upload General
//
// -----------------------------------------------------------------------------------
function directiveMap() {

    var directive = {
        restrict: 'E',
        templateUrl: 'modules/maps/client/views/partials/map-layers.html',
        scope: {
        	layers: '='
        },
        controller: 'controllerMap',
        controllerAs: 'mpl'
    };

    return directive;
}
