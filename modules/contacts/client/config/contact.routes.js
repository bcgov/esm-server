'use strict';
// =========================================================================
//
// contact routes (under admin)
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for contacts.
	// we resolve contacts to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.contact', {
		abstract:true,
		url: '/contact',
		template: '<ui-view></ui-view>',
		resolve: {
			contacts: function ($stateParams, ContactModel) {
				return ContactModel.getCollection ();
			}
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for contacts. contacts are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('admin.contact.list', {
		url: '/list',
		templateUrl: 'modules/contacts/client/views/contact-list.html',
		controller: function ($scope, NgTableParams, contacts) {
			$scope.contacts = contacts;
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: contacts});
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('admin.contact.create', {
		url: '/create',
		templateUrl: 'modules/contacts/client/views/contact-edit.html',
		resolve: {
			contact: function (ContactModel) {
				return ContactModel.getNew ();
			}
		},
		controller: function ($scope, $state, contact, ContactModel, $filter) {
			$scope.contact = contact;
			var which = 'add';
			$scope.calculateName = function() {
				$scope.contact.contactName = [$scope.contact.firstName, $scope.contact.middleName, $scope.contact.lastName].join(' ');
				$scope.contact.code = $filter('kebab')( $scope.contact.contactName );
			};
			$scope.save = function () {
				var p = (which === 'add') ? ContactModel.add ($scope.contact) : ContactModel.save ($scope.contact);
				p.then (function (model) {
					$state.transitionTo('admin.contact.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('admin.contact.edit', {
		url: '/:contactId/edit',
		templateUrl: 'modules/contacts/client/views/contact-edit.html',
		resolve: {
			contact: function ($stateParams, ContactModel) {
				return ContactModel.getModel ($stateParams.contactId);
			}
		},
		controller: function ($scope, $state, contact, ContactModel, $filter) {
			$scope.contact = contact;

			var which = 'edit';
			$scope.calculateName = function() {
				$scope.contact.contactName = [$scope.contact.firstName, $scope.contact.middleName, $scope.contact.lastName].join(' ');
				$scope.contact.code = $filter('kebab')( $scope.contact.contactName );
			};
			$scope.save = function () {
				var p = (which === 'add') ? ContactModel.add ($scope.contact) : ContactModel.save ($scope.contact);
				p.then (function (model) {
					$state.transitionTo('admin.contact.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a contact. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('admin.contact.detail', {
		url: '/:contactId',
		templateUrl: 'modules/contacts/client/views/contact-view.html',
		resolve: {
			contact: function ($stateParams, ContactModel) {
				return ContactModel.getModel ($stateParams.contactId);
			}
		},
		controller: function ($scope, contact, pillars, projecttypes, stages) {
			$scope.contact = contact;
		}
	})

	;

}]);


