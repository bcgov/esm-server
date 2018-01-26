'use strict';
angular.module ('templates')

// -------------------------------------------------------------------------
//
// directive that displays an icon list of documents. click to download.
// if in edit mode it displays a link to manage the list itself.
//
// pass in the project
// title    : what is the title ?
// editable : can we edit the list?
// allfiles : a master list of file OBJECTS
// filelist : a list of which IDs to display, if blank then all
// keeplist : a list of IDs that may be removed from the filelist, but NOT
//            from the master
//
// -------------------------------------------------------------------------
  .directive ('documentLinkList', [ function () {
    return {
      restrict: 'A',
      scope: {
        project  : '=',
        title    : '=',
        editable : '=',
        filelist : '=?'
      },
      replace: true,
      templateUrl: 'modules/templates/documents/views/dir.document.link.list.html',
      link: function(scope) {
        scope.$watch ('filelist', function () {
        });
      }
    };
  }]);

