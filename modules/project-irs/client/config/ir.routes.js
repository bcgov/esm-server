'use strict';
// =========================================================================
//
// inspection report routes
//
// =========================================================================
angular.module('irs').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for inspection reports (irs).
	// since it is a child of p (project), the project injection has already
	// been resolved and is available to subsequent child states as 'project'
	// here we will resolve the list of irs for this project,
	// which will also become available to child states as 'irs'
	//
	// -------------------------------------------------------------------------
	.state('p.ir', {
		abstract:true,
		url: '/ir',
		template: '<ui-view></ui-view>',
		resolve: {
			irs: function ($stateParams, IrModel, project) {
				return IrModel.forProject (project._id);
			},
		},
		onEnter: function (MenuControl, project) {
			MenuControl.routeAccessBuilder (undefined, project.code, '*', ['ce-lead', 'ce-officer']);
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for irs and project are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('p.ir.list', {
		url: '/list',
		templateUrl: 'modules/project-irs/client/views/ir-list.html',
		controller: function ($scope, NgTableParams, irs, project) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: irs});
			$scope.project = project;
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('p.ir.create', {
		url: '/create',
		templateUrl: 'modules/project-irs/client/views/ir-edit.html',
		resolve: {
			ir: function (IrModel, project) {
				return new Promise( function (resolve, reject) {
					IrModel.getNew().then(function (obj) {
						obj.project = project;
						resolve(obj);
					});
				});
			},
			report: function (InspectionReportModel, project) {
				return new Promise( function (resolve, reject) {
					InspectionReportModel.getNew().then(function (obj) {
						obj.projectName			= project.name;
						obj.region				= project.region;
						obj.lat					= project.lat;
						obj.lon					= project.lon;
						obj.sector				= project.sector;
						obj.locationDescription = project.location;
						// console.log("obj",obj);
						resolve(obj);
					});
				});
			}
		},
		controller: function ($scope, $state, project, ir, IrModel, report, InspectionReportModel) {
			$scope.ir = ir;
			$scope.report = report;
			$scope.project = project;
			$scope.save = function () {
				IrModel.add ($scope.ir)
				.then (function (model) {
					$state.transitionTo('p.ir.list', {projectid:project.code}, {
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
	.state('p.ir.edit', {
		url: '/:irId/edit',
		templateUrl: 'modules/project-irs/client/views/ir-edit.html',
		resolve: {
			ir: function ($stateParams, IrModel) {
				// console.log ('editing irId = ', $stateParams.irId);
				return IrModel.getModel ($stateParams.irId);
			}
		},
		controller: function ($scope, $state, ir, project, IrModel) {
			// console.log ('ir = ', ir);
			$scope.ir = ir;
			$scope.project = project;
			$scope.save = function () {
				IrModel.save ($scope.ir)
				.then (function (model) {
					// console.log ('ir was saved',model);
					// console.log ('now going to reload state');
					$state.transitionTo('p.ir.list', {projectid:project.code}, {
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
	// this is the 'view' mode of an ir. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('p.ir.detail', {
		url: '/:irId',
		templateUrl: 'modules/project-irs/client/views/ir-view.html',
		resolve: {
			ir: function ($stateParams, IrModel) {
				// console.log ('irId = ', $stateParams.irId);
				return IrModel.getModel ($stateParams.irId);
			}
		},
		controller: function ($scope, ir, project) {
			// console.log ('ir = ', ir);
			$scope.ir = ir;
			$scope.project = project;
		}
	})

	;

}]);
