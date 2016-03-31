'use strict';
// =========================================================================
//
// topic routes (under admin)
//
// =========================================================================
angular.module('topics').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for topics.
	// we resolve topics to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.topic', {
		data: {roles: ['admin','eao']},
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
			$scope.types = types; //Doesn't hold any values
			$scope.pillars = pillars;
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: topics});
			$scope.getTypes = function () 
			{
				//Hardcoding these values as done on the edit screen
				return [{ id: 'Valued Component', title: 'Valued Component'}, { id: 'Pathway Component', title: 'Pathway Component'}];
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('admin.topic.create', {
		data: {roles: ['admin','edit-topics']},
		url: '/create',
		templateUrl: 'modules/topics/client/views/topic-edit.html',
		resolve: {
			topic: function (TopicModel) {
				return TopicModel.getNew ();
			}
		},
		controller: function ($scope, $state, topic, TopicModel, pillars, types, codeFromTitle) {
			$scope.topic = topic;
			$scope.types = types;
			$scope.pillars = pillars;
			var which = 'add';
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'topicForm');
					return false;
				}
				$scope.topic.code = codeFromTitle ($scope.topic.name);
				var p = (which === 'add') ? TopicModel.add ($scope.topic) : TopicModel.save ($scope.topic);
				p.then (function (model) {
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

					//check to see if the current parent topic is in the topics list
					//if it's not, clear it out
					var topicFound = false;
					for (var i=0; i < topics.length; i++) {
						if (topics[i].code === $scope.topic.parent) {
        					topicFound = true;
							break;
        				}
    				}

    				if(!topicFound) {
    					$scope.topic.parent = '';
    				}

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
		data: {roles: ['admin','edit-topics']},
		url: '/:topicId/edit',
		templateUrl: 'modules/topics/client/views/topic-edit.html',
		resolve: {
			topic: function ($stateParams, TopicModel) {
				return TopicModel.getModel ($stateParams.topicId);
			}
		},
		controller: function ($scope, $state, topic, TopicModel, pillars, types, codeFromTitle) {
			$scope.topic = topic;
			$scope.types = types;
			$scope.pillars = pillars;
			var which = 'edit';
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'topicForm');
					return false;
				}
				$scope.topic.code = codeFromTitle ($scope.topic.name);
				console.log('parent topic = ', $scope.topic.parent);
				var p = (which === 'add') ? TopicModel.add ($scope.topic) : TopicModel.save ($scope.topic);
				p.then (function (model) {
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
					//console.log ('pillar topics = ', topics);
					//console.log ('parent topic = ', $scope.topic.parent);

					//check to see if the current parent topic is in the topics list
					//if it's not, clear it out
					var topicFound = false;
					for (var i=0; i < topics.length; i++) {
						if (topics[i].code === $scope.topic.parent) {
        					topicFound = true;
							break;
        				}
    				}

    				if(!topicFound) {
    					$scope.topic.parent = '';
    				}

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











