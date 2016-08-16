'use strict';
// =========================================================================
//
// inspection report routes
//
// =========================================================================
angular.module('irs').config(['$stateProvider', 'RELEASE', function ($stateProvider, RELEASE) {
	if (RELEASE.enableInspectionReports) {
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
				irs: function ($stateParams, IrModel, project, ArtifactModel) {
					return new Promise (function (resolve, reject) {
						IrModel.forProject (project._id)
						.then( function (irs) {
							Promise.resolve ()
							.then (function () {
								return irs.reduce (function (current, item) {
									return current.then (function () {
										return new Promise (function (r,j) {
											// console.log("item:", item);
											ArtifactModel.lookup(item.artifact)
											.then(function (art) {
												item.artifact = art;
												r(item);
											}, r(null));
										});
									});
								}, Promise.resolve());
							})
							.then ( function () {
								resolve(irs);
							});
						});
					});
				},
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
				ir: function (IrModel, project, ArtifactModel) {
					return new Promise( function (resolve, reject) {
						IrModel.getNew()
						.then(function (obj) {
							obj.project = project;
							return obj;
						}).then(function (o) {
							return ArtifactModel.newFromType("inspection-report", project._id)
							.then(function (art) {
								o.artifact = art;
								resolve(o);
							});
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
			controller: function ($scope, $state, project, ir, IrModel, report, InspectionReportModel, ArtifactModel, $modal, _) {
				$scope.ir = ir;
				$scope.report = report;
				$scope.project = project;
				$scope.canDelete = false;
				$scope.save = function () {
					if (!$scope.inspection.$valid) {
						return false;
					}
					IrModel.add ($scope.ir)
					.then (function (model) {
						return ArtifactModel.save($scope.ir.artifact);
					}).then(function () {
							$state.transitionTo('p.ir.detail', {projectid:project.code, irId:$scope.ir._id}, {
							reload: true, inherit: false, notify: true
						});
					})
					.catch (function (err) {
						console.error (err);
						alert (err);
					});
				};
				$scope.cancel = function () {
					// Remove the added artifact
					ArtifactModel.remove($scope.ir.artifact)
					.then(function () {
							$state.transitionTo('p.ir.detail', {projectid:project.code, irId:$scope.ir._id}, {
							reload: true, inherit: false, notify: true
						});
					});
				};
				$scope.openAddTopic = function() {
					var modalDocView = $modal.open({
						animation: true,
						templateUrl: 'modules/artifacts/client/views/artifact-linker.html',
						controller: 'controllerAddArtifactModal',
						controllerAs: 'self',
						scope: $scope,
						size: 'lg'
					});
					modalDocView.result.then(function (res) {
						// console.log("res",res);
						$scope.ir.conditionArtifacts = [];
						$scope.ir.conditionArtifacts = res;
					}, function () {
						//console.log("err");
					});
				};
				$scope.removeConditionArtifact = function (conditionArtifact) {
					// Find the item and remove it from condition artifacts, then save back the IR and reload
					_.each($scope.ir.conditionArtifacts, function (ca, idx) {
						if (ca._id === conditionArtifact._id) {
							$scope.ir.conditionArtifacts.splice(idx, 1);
						}
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
				ir: function ($stateParams, IrModel, ArtifactModel) {
					// console.log ('irId = ', $stateParams.irId);
					return new Promise( function (resolve, reject) {
						IrModel.getModel ($stateParams.irId)
						.then( function (o) {
							return ArtifactModel.lookup(o.artifact)
							.then( function (art) {
								o.artifact = art;
								resolve(o);
							}, resolve(o));
						});
					});
				}
			},
			controller: function ($scope, $state, ir, project, IrModel, ArtifactModel, $modal, _, ENFORCEMENT_ACTIONS, ENFORCEMENT_STATUS) {
				$scope.ir = ir;
				$scope.project = project;
				$scope.canDelete = ir.userCan.delete;
				$scope.enforcement_actions = ENFORCEMENT_ACTIONS;
				$scope.enforcement_status = ENFORCEMENT_STATUS;
				_.each(ir.conditionArtifacts, function (item, key) {
					ArtifactModel.lookup(item)
					.then( function (o) {
						ir.conditionArtifacts[key] = o;
						$scope.$apply();
					});
				});
				$scope.delete = function () {
					IrModel.deleteId($scope.ir._id)
					.then( function () {
						$state.go('p.ir.list', {projectid:project.code}, {
							reload: true, inherit: false, notify: true
						});
					});
				};
				$scope.save = function () {
					if (!$scope.inspection.$valid) {
						return false;
					}
					IrModel.save ($scope.ir)
					.then (function (model) {
						return ArtifactModel.save($scope.ir.artifact);
					}).then(function () {
						$state.go('p.ir.detail', {projectid:project.code, irId:$scope.ir._id}, {
							reload: true, inherit: false, notify: true
						});
					})
					.catch (function (err) {
						console.error (err);
						alert (err);
					});
				};
				$scope.openAddTopic = function() {
					var modalDocView = $modal.open({
						animation: true,
						templateUrl: 'modules/artifacts/client/views/artifact-linker.html',
						controller: 'controllerAddArtifactModal',
						controllerAs: 'self',
						scope: $scope,
						size: 'lg'
					});
					modalDocView.result.then(function (res) {
						$scope.ir.conditionArtifacts = [];
						$scope.ir.conditionArtifacts = res;
						$state.transitionTo('p.ir.edit', {projectid:project.code, irId:$scope.ir._id}, {
							reload: false, inherit: false, notify: true
						});
					}, function () {
						//console.log("err");
					});
				};
				$scope.removeConditionArtifact = function (conditionArtifact) {
					// Find the item and remove it from condition artifacts, then save back the IR and reload
					_.each($scope.ir.conditionArtifacts, function (ca, idx) {
						if (ca._id === conditionArtifact._id) {
							$scope.ir.conditionArtifacts.splice(idx, 1);
						}
					});
				};
				$scope.openAddEnforcementAction = function () {
					var modalDocView = $modal.open({
						animation: true,
						templateUrl: 'modules/project-irs/client/views/ir-add-action.html',
						controller: 'controllerAddEditEnforcementActionModal',
						controllerAs: 'a',
						scope: $scope,
						size: 'md'
					});
					modalDocView.result.then(function (res) {
						console.log("res:", res);
					}, function () {
						//console.log("err");
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
				ir: function ($stateParams, IrModel, ArtifactModel) {
					// console.log ('irId = ', $stateParams.irId);
					return IrModel.getModel ($stateParams.irId);
				}
			},
			controller: function ($scope, ir, project, ArtifactModel, _) {
				// console.log ('ir = ', ir);
				$scope.ir = ir;
				$scope.project = project;
				_.each(ir.conditionArtifacts, function (item, key) {
					ArtifactModel.lookup(item)
					.then( function (o) {
						ir.conditionArtifacts[key] = o;
						$scope.$apply();
					});
				});
				ArtifactModel.lookup(ir.artifact)
				.then( function (art) {
					ir.artifact = art;
					$scope.$apply();
				});
			}
		});
	}
}]);
