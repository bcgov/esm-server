'use strict';
// =========================================================================
//
// topic routes (under admin)
//
// =========================================================================
angular.module('codelists').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for topics.
	// we resolve topics to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.codelist', {
		data: {permissions: ['manageCodeLists']},
		abstract:true,
		url: '/codelists',
		template: '<ui-view></ui-view>',
		resolve: {
			codelists: function ($stateParams, CodeListModel) {
				return CodeListModel.getCollection();
			}
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for codeLists
	//
	// -------------------------------------------------------------------------
	.state('admin.codelist.list', {
		url: '/list',
		templateUrl: 'modules/code-lists/client/views/code-list-list.html',
		controller: function ($scope, $state, NgTableParams, AlertService, CodeListModel, codelists) {
			var vm = this;
			vm.codelists = codelists;
			vm.currentField = codelists[0];
			vm.tableParams = new NgTableParams ();
			vm.changeFieldType = function(obj) {
				vm.tableParams.settings({
					dataset: vm.currentField.items
				});
			};
			// initialize table
			vm.changeFieldType();
		},
		controllerAs : 'vm'
	})
	// -------------------------------------------------------------------------
	//
	// the edit state for one codelist
	//
	// -------------------------------------------------------------------------
	// .state('admin.codelist.edit', {
	// 	data: {permissions: ['manageCodeLists']},
	// 	url: '/:id/edit',
	// 	templateUrl: 'modules/code-list/client/views/code-list-edit.html',
	// 	resolve: {
	// 		topic: function ($stateParams, TopicModel) {
	// 			return TopicModel.getModel ($stateParams.topicId);
	// 		}
	// 	},
	// 	controller: function ($scope, $state, topic, TopicModel, pillars, types, codeFromTitle) {
	// 		$scope.topic = topic;
	// 		$scope.types = types;
	// 		$scope.pillars = pillars;
	// 		var which = 'edit';
	// 		$scope.save = function (isValid) {
	// 			if (!isValid) {
	// 				$scope.$broadcast('show-errors-check-validity', 'topicForm');
	// 				return false;
	// 			}
	// 			$scope.topic.code = codeFromTitle ($scope.topic.name);
	// 			// console.log('parent topic = ', $scope.topic.parent);
	// 			var p = (which === 'add') ? TopicModel.add ($scope.topic) : TopicModel.save ($scope.topic);
	// 			p.then (function (model) {
	// 				$state.transitionTo('admin.topic.list', {}, {
	// 		  			reload: true, inherit: false, notify: true
	// 				});
	// 			})
	// 			.catch (function (err) {
	// 				console.error (err);
	// 				// alert (err.message);
	// 			});
	// 		};
	// 		$scope.selectTopic = function () {
	// 			TopicModel.getTopicsForPillar ($scope.topic.pillar).then (function (topics) {
	// 				$scope.pillartopics = topics;
	// 				//console.log ('pillar topics = ', topics);
	// 				//console.log ('parent topic = ', $scope.topic.parent);
	//
	// 				//check to see if the current parent topic is in the topics list
	// 				//if it's not, clear it out
	// 				var topicFound = false;
	// 				for (var i=0; i < topics.length; i++) {
	// 					if (topics[i].code === $scope.topic.parent) {
   //      					topicFound = true;
	// 						break;
   //      				}
   //  				}
	//
   //  				if(!topicFound) {
   //  					$scope.topic.parent = '';
   //  				}
	//
	// 				$scope.$apply();
	//
	// 			});
	// 		};
	// 		$scope.selectTopic ();
	// 	}
	// })
	;
}]);











