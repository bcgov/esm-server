'use strict';
// =========================================================================
//
// org routes (under admin)
//
// =========================================================================
angular.module('emailtemplate').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for email-template.
	// we resolve email-template to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.emailtemplate', {
		data: {permissions: ['listEmailTemplates']},
		abstract:true,
		url: '/emailtemplate',
		template: '<ui-view></ui-view>',
		controller: function ($scope, projectsLookup) {
			$scope.projects = projectsLookup;
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for email-template. email-template are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('admin.emailtemplate.list', {
		url: '/list',
		templateUrl: 'modules/email-templates/client/views/email-template-list.html',
		resolve: {
			emailtemplate: function ($stateParams, EmailTemplateModel) {
				return EmailTemplateModel.getCollection();
			}
		},
		controller: function ($scope, $state, AlertService, NgTableParams, emailtemplate, EmailTemplateModel) {
			var s = this;
			$scope.tableParams = new NgTableParams({count: 10}, {dataset: emailtemplate});
			s.confirmText = function(template) {
				return "Are you sure you would like to permanently delete email template '"+ template.name + "'?";
			}
			s.deleteEmailTemplate = function (template) {
				console.log("Delete email template", template);
				return EmailTemplateModel.deleteId(template._id)
					.then(
						function (result) {
							$state.reload();
							AlertService.success('Email Template was deleted!');
						},
						function (error) {
							$state.reload();
							AlertService.error('Email Template could not be deleted.');
						});
			};
		},
		controllerAs: 's'
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('admin.emailtemplate.create', {
		data: {permissions: ['createEmailTemplate']},
		url: '/create',
		templateUrl: 'modules/email-templates/client/views/email-template-edit.html',
		resolve: {
			emailtemplate: function (EmailTemplateModel) {
				return EmailTemplateModel.getNew ();
			}
		},
		controller: function ($scope, $state, emailtemplate, EmailTemplateModel, $filter) {
			$scope.emailtemplate = emailtemplate;
			var which = 'add';
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'emailTemplateForm');
					return false;
				}
				$scope.emailtemplate.code = $filter('kebab')($scope.emailtemplate.name);
				var p = (which === 'add') ? EmailTemplateModel.add ($scope.emailtemplate) : EmailTemplateModel.save ($scope.emailtemplate);
				p.then (function (model) {
					$state.transitionTo('admin.emailtemplate.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('admin.emailtemplate.edit', {
		data: {permissions: ['createEmailTemplate']},
		url: '/:emailtemplateId/edit',
		templateUrl: 'modules/email-templates/client/views/email-template-edit.html',
		resolve: {
			emailtemplate: function ($stateParams, EmailTemplateModel) {
				return EmailTemplateModel.getModel ($stateParams.emailtemplateId);
			}
		},
		controller: function ($scope, $state, emailtemplate, EmailTemplateModel, $filter) {
			$scope.emailtemplate = emailtemplate;
			var which = 'edit';
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'emailtemplateForm');
					return false;
				}
				$scope.emailtemplate.code = $filter('kebab')($scope.emailtemplate.name);
				var p = (which === 'add') ? EmailTemplateModel.add ($scope.emailtemplate) : EmailTemplateModel.save ($scope.emailtemplate);
				p.then (function (model) {
					$state.transitionTo('admin.emailtemplate.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a emailtemplate. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('admin.emailtemplate.detail', {
		url: '/:emailtemplateId',
		templateUrl: 'modules/email-templates/client/views/email-template-view.html',
		resolve: {
			emailtemplate: function ($stateParams, EmailTemplateModel) {
				return EmailTemplateModel.getModel ($stateParams.emailtemplateId);
			}
		},
		controller: function ($scope, emailtemplate) {
			$scope.emailtemplate = emailtemplate;
		}
	})

	;

}]);


