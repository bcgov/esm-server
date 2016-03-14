'use strict';
// =========================================================================
//
// template routes (under admin)
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	// -------------------------------------------------------------------------
	//
	// A shared controller for add/edit
	//
	// -------------------------------------------------------------------------
	var addEdit = function (which, $scope, $state, template, TemplateModel, types) {
		$scope.types    = types;
		$scope.template = template;
		$scope.which    = which;
		// -------------------------------------------------------------------------
		//
		// add a new section to the template
		//
		// -------------------------------------------------------------------------
		$scope.addSection = function () {
			TemplateModel.newSection ().then (function (s) {
				$scope.template.sections.push (s);
				$scope.$apply ();
			});
		};
		// -------------------------------------------------------------------------
		//
		// add a variable to the meta data area that will get replaced in the
		// template
		//
		// -------------------------------------------------------------------------
		$scope.addVariable = function (meta) {
			TemplateModel.newMeta ().then (function (m) {
				meta.push (m);
				$scope.$apply ();
			});
		};
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
	};

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
			},
			types: function (DOCUMENT_TEMPLATE_TYPES) {
				return DOCUMENT_TEMPLATE_TYPES;
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
			}
		},
		controller: function ($scope, $state, template, TemplateModel, types) {
			addEdit ('add', $scope, $state, template, TemplateModel, types);
			// $scope.types    = types;
			// $scope.template = template;
			// var which       = 'add';
			// // -------------------------------------------------------------------------
			// //
			// // add a new section to the template
			// //
			// // -------------------------------------------------------------------------
			// $scope.addSection = function () {
			// 	TemplateModel.newSection ().then (function (s) {
			// 		$scope.template.sections.push (s);
			// 		$scope.$apply ();
			// 	});
			// };
			// // -------------------------------------------------------------------------
			// //
			// // add a variable to the meta data area that will get replaced in the
			// // template
			// //
			// // -------------------------------------------------------------------------
			// $scope.addVariable = function (meta) {
			// 	TemplateModel.newMeta ().then (function (m) {
			// 		meta.push (m);
			// 		$scope.$apply ();
			// 	});
			// };
			// $scope.save = function () {
			// 	var p = (which === 'add') ? TemplateModel.add ($scope.template) : TemplateModel.save ($scope.template);
			// 	p.then (function (model) {
			// 		$state.transitionTo('admin.template.list', {}, {
			//   			reload: true, inherit: false, notify: true
			// 		});
			// 	})
			// 	.catch (function (err) {
			// 		console.error (err);
			// 		alert (err);
			// 	});
			// };
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
			}
		},
		controller: function ($scope, $state, template, TemplateModel, types) {
			addEdit ('edit', $scope, $state, template, TemplateModel, types);
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
	// -------------------------------------------------------------------------
	//
	// this is used to test the template editing
	//
	// -------------------------------------------------------------------------
	.state ('admin.template.test', {
		url: '/:templateId/test',
		templateUrl: 'modules/templates/client/views/template-test.html',
		resolve: {
			template: function ($stateParams, TemplateModel) {
				return TemplateModel.getModel ($stateParams.templateId);
			}
		},
		controller: function ($scope, template, templateData, $location, $anchorScroll) {
			$scope.template = template;
			var tData = templateData (template);
			$scope.dataset = tData.document;
			$scope.allsections = tData.sectionList ();
			$scope.repeatsections = tData.repeatable ();
			$scope.gosection = '';
			$scope.newsection = '';
			$scope.goto = function (sectionname) {
				console.log ('goto ', sectionname);
				$location.hash (sectionname);
				$anchorScroll ();
				$scope.gosection = '';
			};
			$scope.append = function (sectionname) {
				console.log ('append ', sectionname);
				tData.push (sectionname);
				$scope.newsection = '';
			};
		}

	})

	;

}]);


