'use strict';
angular.module('otherdocuments')
	.controller('otherDocumentsListController', otherDocumentsListController)
	.directive('otherDocumentsList', otherDocumentsListDirective);

function otherDocumentsListDirective() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/other-documents/client/views/project-other-document.html',
		scope: {
			project: "=project",
			otherDocuments: "=otherDocuments"
		},
		controller: otherDocumentsListController,
		controllerAs: 'vm'
	};
	return directive;
}

otherDocumentsListController.$inject = ['$scope', '_'];
/* @ngInject */
function otherDocumentsListController($scope, _) {
	var vm = this;
	vm.otherDocuments = $scope.otherDocuments;
	vm.groupings = [];
	var sortedList = _.sortByOrder(vm.otherDocuments, ['heading', 'date'],['asc', 'desc']);
	var headings = new Set();
	_.forEach(vm.otherDocuments, function(doc) {
		headings.add(doc.heading);
	});
	headings.forEach(function(hdr) {
		var set = _.filter(sortedList, function (doc) {
			return doc.heading === hdr;
		});
		if (_.size(set) > 0) {
			vm.groupings.push({
				name: hdr,
				list: set
			});
		}
	});
	console.log(sortedList, headings, vm.groupings);
}