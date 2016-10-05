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
			controller: function (Utils, ProjectConditionModel, $scope, $state, project, ir, IrModel, report, InspectionReportModel, ArtifactModel, $modal, _, EnforcementModel, ENFORCEMENT_ACTIONS, ENFORCEMENT_STATUS) {
				$scope.ir = ir;
				$scope.report = report;
				$scope.project = project;
				$scope.isCreating = true;
				$scope.canDelete = false;
				$scope.enforcement_actions = ENFORCEMENT_ACTIONS;
				$scope.enforcement_status = ENFORCEMENT_STATUS;
				$scope.save = function () {
					if (!$scope.inspection.$valid) {
						return false;
					}
					IrModel.add ($scope.ir)
					.then (function () {
						// For each enforcement action added - add them.
						_.each($scope.ir.enforcementActions, function (ea) {
							EnforcementModel.add(ea);
						});
					}).then(function () {
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
				$scope.removeCondition = function (obj) {
					// Find the item and remove it from condition artifacts, then save back the IR and reload
					_.each($scope.ir.conditions, function (c, idx) {
						if (c._id === obj._id) {
							$scope.ir.conditions.splice(idx, 1);
						}
					});
					_.each($scope.ir.conditionArtifacts, function (ca, idx) {
						if (ca._id === obj._id) {
							$scope.ir.conditionArtifacts.splice(idx, 1);
						}
					});
				};
				$scope.openAddEnforcementAction = function (obj) {
					var modalDocView = $modal.open({
						animation: true,
						templateUrl: 'modules/project-irs/client/views/ir-add-action.html',
						controller: 'controllerAddEditEnforcementActionModal',
						controllerAs: 'a',
						scope: $scope,
						size: 'md',
						resolve: {
							current: function () {
								// console.log("resolving current:", obj);
								if (!obj) {
									return EnforcementModel.getNew();
								} else {
									// _.each(obj.condition, function (i, idx) {
									// 	// console.log("condition:", i);
									// 	if (!angular.isObject(i)) {
									// 		ProjectConditionModel.lookup(i)
									// 		.then(function (o) {
									// 			obj.condition[idx] = o;
									// 		}, function () {
									// 			return i;
									// 		});
									// 	}
									// });
									// _.each(obj.conditionArtifacts, function (i, idx) {
									// 	// console.log("conditionArtifacts:", i);
									// 	if (!angular.isObject(i)) {
									// 		ArtifactModel.lookup(i)
									// 		.then(function (o) {
									// 			obj.conditionArtifacts[idx] = o;
									// 		}, function () {
									// 			return i;
									// 		});
									// 	}
									// });
									return obj;
								}
							}
						}
					});
					modalDocView.result.then(function (res) {
						// console.log("res:", res);
						if (obj) {
							_.each($scope.ir.enforcementActions, function (item, idx) {
								if (item && (obj._id === item._id)) {
									$scope.ir.enforcementActions.splice(idx, 1);
									$scope.ir.enforcementActions.push(res);
								}
							});
						} else {
							res.new = true;
							$scope.ir.enforcementActions.push(res);
						}
					}, function () {
						//console.log("err");
					});
				};
				$scope.deleteAction = function (obj) {
					_.each($scope.ir.enforcementActions, function (item, idx) {
						if (item && (obj._id === item._id)) {
							$scope.ir.enforcementActions.splice(idx, 1);
							// If this was a recently added item, it hasn't been
							// peristed to the DB yet.  So no need to fully delete on "save"
							if (!item.new) {
								$scope.deleteActionItems.push(item);
							}
						}
					});
				};
				$scope.addEditEnforcementActionCondition = function (action) {
					var irConditions = [];
					_.each($scope.ir.conditions, function (i) {
						irConditions.push(i);
					});
					_.each($scope.ir.conditionArtifacts, function (i) {
						irConditions.push(i);
					});
					var cur = [];
					_.each(action.condition, function (i) {
						cur.push(i);
					});
					_.each(action.conditionArtifacts, function (i) {
						cur.push(i);
					});
					return Utils.openEntitySelectionModal(irConditions, 'name', cur, 'Conditions')
					.then(function (selected) {
						// console.log("selected:", selected);
						action.condition = [];
						action.conditionArtifacts = [];
						_.each(selected, function (i) {
							// console.log("schem:", i._schemaName);
							if (i._schemaName === 'ProjectCondition') {
								action.condition.push(i);
							} else if (i._schemaName === 'Artifact') {
								action.conditionArtifacts.push(i);
							} else {
								action.conditionArtifacts.push(i);
							}
						});
					});
				};
				$scope.addIRCondition = function () {
					ProjectConditionModel.forProject($scope.project._id)
					.then(function (data) {
						return Utils.openEntitySelectionModal(data, 'name', $scope.ir.conditions, 'Conditions');
					})
					.then(function (newSel) {
						$scope.ir.conditions = newSel;
					});
				};
				$scope.removeEnforcementActionCondition = function(o, action) {
					// console.log("removing: ", o);
					if (o._schemaName === 'ProjectCondition') {
						_.each(action.condition, function (i, idx) {
							if (i._id === o._id) {
								action.condition.splice(idx, 1);
							}
						});
					} else if (o._schemaName === 'Artifact') {
						_.each(action.conditionArtifacts, function (i, idx) {
							if (i._id === o._id) {
								action.conditionArtifacts.splice(idx, 1);
							}
						});
					}
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
			controller: function (Utils, ProjectConditionModel, $scope, $state, ir, project, IrModel, ArtifactModel, $modal, _, ENFORCEMENT_ACTIONS, ENFORCEMENT_STATUS, EnforcementModel) {
				$scope.ir = ir;
				$scope.project = project;
				$scope.canDelete = ir.userCan.delete;
				$scope.enforcement_actions = ENFORCEMENT_ACTIONS;
				$scope.enforcement_status = ENFORCEMENT_STATUS;
				$scope.canPublish = ir.userCan.publish && !ir.isPublished;
				$scope.canUnpublish = ir.userCan.unPublish && ir.isPublished;
				$scope.deleteActionItems = [];

				// console.log("ir.userCan:", ir.userCan);

				_.each(ir.conditionArtifacts, function (item, key) {
					ArtifactModel.lookup(item)
					.then( function (o) {
						ir.conditionArtifacts[key] = o;
						$scope.$apply();
					});
				});
				_.each(ir.conditions, function (item, key) {
					ProjectConditionModel.lookup(item)
					.then( function (o) {
						ir.conditions[key] = o;
						$scope.$apply();
					});
				});
				_.each(ir.enforcementActions, function (item, key) {
					EnforcementModel.lookup(item)
					.then( function (o) {
						ir.enforcementActions[key] = o;
						_.each(o.condition, function (con, idx) {
							ProjectConditionModel.lookup(con)
							.then(function (conObj) {
								o.condition[idx] = conObj;
							});
						});
						_.each(o.conditionArtifacts, function (ca, idx) {
							ArtifactModel.lookup(ca)
							.then(function (conObj) {
								o.conditionArtifacts[idx] = conObj;
							});
						});
						if (o.orderArtifact) {
							ArtifactModel.lookup(o.orderArtifact)
							.then(function (conObj) {
								o.orderArtifact = conObj;
							});
						}
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
					.then (function () {
						// For each enforcement action added - add them.
						_.each($scope.ir.enforcementActions, function (ea) {
							if (ea.new) {
								EnforcementModel.add(ea);
							} else {
								// Dirty? Save it.
								EnforcementModel.save(ea);
							}
						});
					}).then(function () {
						return ArtifactModel.save($scope.ir.artifact);
					}).then(function () {
						_.each($scope.deleteActionItems, function (item) {
							// Delete the action items
							EnforcementModel.deleteId(item._id);
						});
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
				$scope.removeCondition = function (obj) {
					// Find the item and remove it from condition artifacts, then save back the IR and reload
					_.each($scope.ir.conditions, function (c, idx) {
						if (c._id === obj._id) {
							$scope.ir.conditions.splice(idx, 1);
						}
					});
					_.each($scope.ir.conditionArtifacts, function (ca, idx) {
						if (ca._id === obj._id) {
							$scope.ir.conditionArtifacts.splice(idx, 1);
						}
					});
				};
				$scope.openAddEnforcementAction = function (obj) {
					var modalDocView = $modal.open({
						animation: true,
						templateUrl: 'modules/project-irs/client/views/ir-add-action.html',
						controller: 'controllerAddEditEnforcementActionModal',
						controllerAs: 'a',
						scope: $scope,
						size: 'md',
						resolve: {
							current: function () {
								// console.log("resolving current:", obj);
								if (!obj) {
									return EnforcementModel.getNew();
								} else {
									_.each(obj.condition, function (i, idx) {
										// console.log("condition:", i);
										if (!angular.isObject(i)) {
											ProjectConditionModel.lookup(i)
											.then(function (o) {
												obj.condition[idx] = o;
											});
										}
									});
									_.each(obj.conditionArtifacts, function (i, idx) {
										// console.log("conditionArtifacts:", i);
										if (!angular.isObject(i)) {
											ArtifactModel.lookup(i)
											.then(function (o) {
												obj.conditionArtifacts[idx] = o;
											});
										}
									});
									if (obj.orderArtifact && !angular.isObject(obj.orderArtifact)) {
										ArtifactModel.lookup(obj.orderArtifact)
										.then( function (oa) {
											obj.orderArtifact = oa;
										});
										return obj;
									} else {
										return obj;
									}
								}
							}
						}
					});
					modalDocView.result.then(function (res) {
						// console.log("res:", res);
						if (obj) {
							_.each($scope.ir.enforcementActions, function (item, idx) {
								if (item && (obj._id === item._id)) {
									$scope.ir.enforcementActions.splice(idx, 1);
									$scope.ir.enforcementActions.push(res);
								}
							});
						} else {
							res.new = true;
							$scope.ir.enforcementActions.push(res);
						}
					}, function () {
						//console.log("err");
					});
				};
				$scope.deleteAction = function (obj) {
					_.each($scope.ir.enforcementActions, function (item, idx) {
						if (item && (obj._id === item._id)) {
							$scope.ir.enforcementActions.splice(idx, 1);
							// If this was a recently added item, it hasn't been
							// peristed to the DB yet.  So no need to fully delete on "save"
							if (!item.new) {
								$scope.deleteActionItems.push(item);
							}
						}
					});
				};
				$scope.publish = function () {
					// console.log("publishing ir:", $scope.ir._id);
					IrModel.publish($scope.ir._id)
					.then( function () {
						$state.go('p.ir.detail', {projectid:project.code, irId:$scope.ir._id}, {
							reload: true, inherit: false, notify: true
						});
					});
				};
				$scope.unpublish = function () {
					// console.log("unpublishing ir:", $scope.ir._id);
					IrModel.unpublish($scope.ir._id)
					.then( function () {
						$state.go('p.ir.detail', {projectid:project.code, irId:$scope.ir._id}, {
							reload: true, inherit: false, notify: true
						});
					});
				};
				$scope.addEditEnforcementActionCondition = function (action) {
					// console.log("action:", action);
					IrModel.conditionsForIr($scope.ir._id)
					.then(function (data) {
						console.log("data:", data);
						// Merge the two conditions && conditionArtifacts into one array
						var arr = [];
						_.each(data[0].conditions, function (i) {
							arr.push({ type: 'condition', obj: i});
						});
						_.each(data[0].conditionArtifacts, function (i) {
							arr.push({ type: 'conditionArtifact', obj: i});
						});
						// Go through all the items in the array and resolve their objects so that the picker
						// can show the correct name
						var irConditions = [];
						return new Promise(function (rs, rj) {
							Promise.resolve ()
							.then (function () {
								return arr.reduce (function (current, item) {
									return current.then (function () {
										// console.log("looking up:", item);
										if(item.type === 'condition') {
											return ProjectConditionModel.lookup(item.obj)
											.then( function (o) {
												irConditions.push(o);
												return o;
											});
										} else if (item.type === 'conditionArtifact') {
											return ArtifactModel.lookup(item.obj)
											.then( function (o) {
												irConditions.push(o);
												return o;
											});
										}
										return null;
									});
								}, Promise.resolve());
							}).then(rs, rj);
						}).then(function () {
							var cur = [];
							_.each(action.condition, function (i) {
								cur.push(i);
							});
							_.each(action.conditionArtifacts, function (i) {
								cur.push(i);
							});
							return Utils.openEntitySelectionModal(irConditions, 'name', cur, 'Enforcement Conditions')
							.then(function (selected) {
								// console.log("selected:", selected);
								action.condition = [];
								action.conditionArtifacts = [];
								_.each(selected, function (i) {
									console.log("schem:", i._schemaName);
									if (i._schemaName === 'ProjectCondition') {
										action.condition.push(i);
									} else if (i._schemaName === 'Artifact') {
										action.conditionArtifacts.push(i);
									}
								});
							});
						});
					});
				};
				$scope.addIRCondition = function () {
					ProjectConditionModel.forProject($scope.project._id)
					.then(function (data) {
						return Utils.openEntitySelectionModal(data, 'name', $scope.ir.conditions, 'Conditions');
					})
					.then(function (newSel) {
						$scope.ir.conditions = newSel;
					});
				};
				$scope.removeEnforcementActionCondition = function(o, action) {
					// console.log("removing: ", o);
					if (o._schemaName === 'ProjectCondition') {
						_.each(action.condition, function (i, idx) {
							if (i._id === o._id) {
								action.condition.splice(idx, 1);
							}
						});
					} else if (o._schemaName === 'Artifact') {
						_.each(action.conditionArtifacts, function (i, idx) {
							if (i._id === o._id) {
								action.conditionArtifacts.splice(idx, 1);
							}
						});
					}
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
			controller: function ($scope, ir, project, ArtifactModel, _, EnforcementModel, ProjectConditionModel) {
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
				_.each(ir.conditions, function (item, key) {
					ProjectConditionModel.lookup(item)
					.then( function (o) {
						ir.conditions[key] = o;
						$scope.$apply();
					});
				});
				_.each(ir.enforcementActions, function (item, key) {
					EnforcementModel.lookup(item)
					.then( function (o) {
						ir.enforcementActions[key] = o;
						_.each(o.condition, function (con, idx) {
							ProjectConditionModel.lookup(con)
							.then(function (conObj) {
								o.condition[idx] = conObj;
							});
						});
						_.each(o.conditionArtifacts, function (ca, idx) {
							ArtifactModel.lookup(ca)
							.then(function (conObj) {
								o.conditionArtifacts[idx] = conObj;
							});
						});
						if (o.orderArtifact) {
							ArtifactModel.lookup(o.orderArtifact)
							.then(function (conObj) {
								o.orderArtifact = conObj;
							});
						}
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
