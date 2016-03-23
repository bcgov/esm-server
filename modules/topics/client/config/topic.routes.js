'use strict';
// =========================================================================
//
// topic routes (under admin)
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for topics.
	// we resolve topics to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.topic', {
		abstract:true,
		url: '/topic',
		template: '<ui-view></ui-view>',
		resolve: {
			topics: function ($stateParams, TopicModel) {
				return TopicModel.getCollection ();
			},
			pillars: function (PILLARS) {
				return PILLARS.map (function (e) {
					return {id:e,title:e};
				});
			},
			types: function () {
				return ['Valued Component', 'Pathway Component'];
			}
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for topics. topics are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('admin.topic.list', {
		url: '/list',
		templateUrl: 'modules/topics/client/views/topic-list.html',
		controller: function ($scope, NgTableParams, topics, pillars, types) {
			$scope.types = types;
			$scope.pillars = pillars;
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: topics});
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('admin.topic.create', {
		url: '/create',
		templateUrl: 'modules/topics/client/views/topic-edit.html',
		resolve: {
			topic: function (TopicModel) {
				return TopicModel.getNew ();
			}
		},
		controller: function ($scope, $state, topic, TopicModel, pillars, types) {
			$scope.topic = topic;
			$scope.types = types;
			$scope.pillars = pillars;
			$scope.save = function () {
				TopicModel.add ($scope.topic)
				.then (function (model) {
					$state.transitionTo('admin.topic.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
			$scope.selectTopic = function () {
				TopicModel.getTopicsForPillar ($scope.topic.pillar).then (function (topics) {
					$scope.pillartopics = topics;
					$scope.$apply();
				});
			};
			$scope.selectTopic ();
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('admin.topic.edit', {
		url: '/:topicId/edit',
		templateUrl: 'modules/topics/client/views/topic-edit.html',
		resolve: {
			topic: function ($stateParams, TopicModel) {
				return TopicModel.getModel ($stateParams.topicId);
			}
		},
		controller: function ($scope, $state, topic, TopicModel, pillars, types) {
			$scope.topic = topic;
			$scope.types = types;
			$scope.pillars = pillars;
			$scope.save = function () {
				TopicModel.save ($scope.topic)
				.then (function (model) {
					$state.transitionTo('admin.topic.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
			$scope.selectTopic = function () {
				TopicModel.getTopicsForPillar ($scope.topic.pillar).then (function (topics) {
					$scope.pillartopics = topics;
					// console.log ('pillar topics = ', topics);
					// console.log ('parent topic = ', $scope.topic.parent);
					$scope.$apply();
				});
			};
			$scope.selectTopic ();
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a topic. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('admin.topic.detail', {
		url: '/:topicId',
		templateUrl: 'modules/topics/client/views/topic-view.html',
		resolve: {
			topic: function ($stateParams, TopicModel) {
				return TopicModel.getModel ($stateParams.topicId);
			}
		},
		controller: function ($scope, topic, pillars, types) {
			$scope.topic = topic;
			$scope.types = types;
			$scope.pillars = pillars;
		}
	})

	;

}]);











