'use strict';

angular.module('core')
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Activity Listing
//
// -----------------------------------------------------------------------------------
  .directive ('tmplHeader', function () {
    return {
      restrict    : 'E',
      templateUrl : 'modules/core/client/views/header.client.view.html',
      controller  : function ($scope, Authentication, Menus, _, ENV, Application) {
        //console.log ('Application =',Application);
        $scope.application = Application;
        $scope.authentication = Authentication;
        $scope.ENV = ENV;
        $scope.systemMenu = Menus.getMenu ('systemMenu');
        // -------------------------------------------------------------------------
        //
        // literally toggle the side menu
        //
        // -------------------------------------------------------------------------
        $scope.toggleSideMenu = function() {

          $scope.showSideMenu = !$scope.showSideMenu;

          var main = angular.element( document.querySelector( '#main-content-section' ) );
          var side = angular.element( document.querySelector( '#main-side-section' ) );
          var foot = angular.element( document.querySelector( '#main-foot-content' ) );

          main.toggleClass('col-sm-12 col-sm-10');
          foot.toggleClass('col-sm-12 col-sm-10');
          side.toggleClass('col-sm-2 col-0');
        };

        // -------------------------------------------------------------------------
        //
        // really do need to watch here as this directive sits above ui-router resolves
        //
        // -------------------------------------------------------------------------
        $scope.$watch('project', function(newValue) {
          if (newValue) {
            $scope.project = newValue;
          }
        });
      }
    };
  });
