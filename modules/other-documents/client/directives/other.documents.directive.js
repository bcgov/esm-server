'use strict';
angular.module('otherdocuments')
	.controller('otherDocumentsListController', otherDocumentsListController)
	.directive('otherDocumentsList', otherDocumentsListDirective);

function otherDocumentsListDirective() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/other-documents/client/views/project-other-document.html',
		scope: {
			project: "=project"
		},
		controller: otherDocumentsListController,
		controllerAs: 'otherDocumentList'
	};
	return directive;
}

otherDocumentsListController.$inject = ['$scope', '_', 'OtherDocumentModel'];
/* @ngInject */
function otherDocumentsListController($scope, _, OtherDocumentModel) {
	var _this = this;
	var project = $scope.project;
	var code = project.code;
	console.log("Look for docs for ", code);
	OtherDocumentModel.forProjectCode(code)
		.then(function (data) {
			var sortedList = _.sortBy(data, function(doc) {
				return doc.heading;
			});
			// console.log("sortedList",sortedList);
			var headings = new Set();
			_.forEach(data, function(a) {
				headings.add(a.heading);
			});
			// console.log("headings",headings);
			var map = [];
			headings.forEach(function(h){
				console.log("in for each h", h);
				var set = _.filter(sortedList,function(d) {
					// console.log("filtering", h, d.heading);
					return d.heading === h;
				});
				if(_.size(set) > 0) {
					map.push({
						name: h,
						list: set
					});
				}
			});
			console.log("map",map);
			$scope.headings = map;
		});
}