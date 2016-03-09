'use strict';
// -------------------------------------------------------------------------
//
// A shared controller for add/edit
//
// -------------------------------------------------------------------------
var addEdit = function (which, $scope, $state, template, TemplateModel, TopicModel, types) {
	$scope.template = template;
	$scope.save = function () {
		var p = (which === 'add') ? TemplateModel.add ($scope.template) : TemplateModel.save ($scope.template);
		p.then (function (model) {
			$state.transitionTo('admin.template.list', {}, {
	  			reload: true, inherit: false, notify: true
			});
		})
		.catch (function (err) {
			console.error (err);
			alert (err);
		});
	};
	$scope.selectTopic = function () {
		if (!$scope.template.pillar) return;
		TopicModel.getTopicsForPillar ($scope.template.pillar).then (function (topics) {
			console.log ('topics = ', $scope.topics);
			$scope.topics = topics;
			$scope.$apply();
		});
	};
	$scope.selectTopic ();
};
// =========================================================================
//
// template routes (under admin)
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for templates.
	// we resolve templates to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.template', {
		abstract:true,
		url: '/template',
		template: '<ui-view></ui-view>',
		resolve: {
			templates: function ($stateParams, TemplateModel) {
				return TemplateModel.currentTemplates ();
			}
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for templates. templates are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('admin.template.list', {
		url: '/list',
		templateUrl: 'modules/templates/client/views/template-list.html',
		controller: function ($scope, NgTableParams, templates) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: templates});
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('admin.template.create', {
		url: '/create',
		templateUrl: 'modules/templates/client/views/template-edit.html',
		resolve: {
			template: function (TemplateModel) {
				return TemplateModel.getNew ();
			},
			types: function (DOCUMENT_TEMPLATE_TYPES) {
				return DOCUMENT_TEMPLATE_TYPES;
			}
		},
		controller: function ($scope, $state, template, TemplateModel, types) {
			addEdit ('add', $scope, $state, template, TemplateModel, types);
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('admin.template.edit', {
		url: '/:templateId/edit',
		templateUrl: 'modules/templates/client/views/template-edit.html',
		resolve: {
			template: function ($stateParams, TemplateModel) {
				return TemplateModel.getModel ($stateParams.templateId);
			},
			types: function (DOCUMENT_TEMPLATE_TYPES) {
				return DOCUMENT_TEMPLATE_TYPES;
			}
		},
		controller: function ($scope, $state, template, TemplateModel, TopicModel, types) {
			addEdit ('edit', $scope, $state, template, TemplateModel, TopicModel, types);
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a template. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('admin.template.detail', {
		url: '/:templateId',
		templateUrl: 'modules/templates/client/views/template-view.html',
		resolve: {
			template: function ($stateParams, TemplateModel) {
				return TemplateModel.getModel ($stateParams.templateId);
			}
		},
		controller: function ($scope, template) {
			$scope.template = template;
		}
	})

	;

}]);


