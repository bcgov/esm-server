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
.directive ('documentLinkList', [ '_', 'Document', function (_, Document) {
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
		link: function(scope, element, attrs) {
			//console.log ("Running");
			scope.$watch ('filelist', function () {
				// Document.getDocumentsInList (scope.list).then (function (result) {
				// 	//console.log (result);
				// });
				// scope.displaylist.length = 0;
				// scope.list.map (function (e) {
				// 	scope.displaylist.push
				// })
			});
			// var all  = scope.allfiles;
			// var keep = angular.isDefined (scope.keeplist) ? scope.keeplist : [];
			// var list = angular.isDefined (scope.filelist) ? scope.filelist : all.map (function (e) { return e._id; });
			// scope.displaylist = [];
			// scope.list = list;
		}
	};
}])

;
