'use strict';

angular.module('artifacts')

// -------------------------------------------------------------------------
//
// a template style directive with isolated scope for viewing and
// interacting with a list of artifacts
//
// -------------------------------------------------------------------------
.directive('tmplArtifactList', function ($state, $modal, ArtifactModel) {
	return {
		restrict: 'E',
		templateUrl: 'modules/artifacts/client/views/artifact-list.html',
		scope: {
			project: '=',
			published: '='
		},
		controller: function ($scope, NgTableParams, Authentication, _, PhaseBaseModel) {
			var s = this;
			s.public = (!Authentication.user);
			s.published = $scope.published;
			s.caption = s.published ? "Published Content" : "In Progress Content";
			s.allowAddItem = !s.published && $scope.project.userCan.createArtifact;
			s.showFilter = false;
			s.noDataMessage = "There is no in progress content at this time.";


			// filter lists...
			s.versionArray = [];
			s.stageArray = [];
			s.phaseArray = [];

			s.project = $scope.project;
			

			s.openAddTypes = function () {
				
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/artifacts/client/views/artifact-type-chooser.html',
					resolve: {
						artifactTypes: function () {
							//console.log($scope.project);
							return [];
						},
						phases: function () {
							return [];
						}
					},
					controller: function ($modalInstance, $scope, NgTableParams, Authentication, PhaseBaseModel, _, $stateParams, ArtifactModel, artifactTypes, phases) {
						var chooser = this;
						chooser.current = [];
						chooser.currentObjs = [];

						chooser.phaseArray = [];


						chooser.ok = function () {
							var savedArray = [];
							// console.log("length: ",self.currentObjs.length);
							_.each(chooser.currentObjs, function (obj, idx) {
								savedArray.push(obj);
								if (idx === chooser.currentObjs.length - 1) {
									// Return the collection back to the caller
									$modalInstance.close(savedArray);
								}
							});
						};
						chooser.cancel = function () {
							$modalInstance.dismiss('cancel');
						};

						chooser.toggleItem = function (item) {
							// console.log("item:",item);
							var idx = chooser.current.indexOf(item._id);
							// console.log(idx);
							if (idx === -1) {
								chooser.currentObjs.push(item);
								chooser.current.push(item._id);
							} else {
								_.remove(chooser.currentObjs, {_id: item._id});
								_.remove(chooser.current, function (n) {
									return n === item._id;
								});
							}
						};

						chooser.init = function () {

							PhaseBaseModel.all()
							.then(function (p) {
								chooser.phaseArray.push({id: '*', title: 'Any Phase'}); // identify and sort items without a particular phase defined...

								_.forEach(p, function (item) {
									chooser.phaseArray.push({id: item.code, title: item.name});
								});
							});

							ArtifactModel.availableTypes($scope.project._id)
							.then(function (c) {

								var filteredDataset = _.filter(c, function(o) { return 'valued-component' !== o.code; });

								_.forEach(filteredDataset, function (item) {
									if (item.phase === '') {
										item.phase = '*'; // identify and sort items without a particular phase defined...
									}
									// add in a user readable phase name
									var p = _.find(chooser.phaseArray, function (o) {
										return o.id === item.phase;
									});
									item.phaseName = (p) ? p.title : '';
								});

								chooser.tableParams = new NgTableParams({ count: 10, sorting: {name: 'asc'} }, {dataset: filteredDataset});

							});
						};

						chooser.init();
					},
					controllerAs: 'chooser',
					scope: $scope,
					size: 'lg'
				});
				
				modalDocView.result.then(function (res) {
					if (res && res.length > 0) {
						var a = _.map(res, function (o) {
							return ArtifactModel.newFromType(o.code, $scope.project._id);
						});

						Promise.all(a).then(function () {
							// tell the parent controller to init (refresh it's data/state)...
							s.init();
						});
					}
				}, function () {
					//console.log("err");
				});
			};
			
			s.init = function () {
				// In this view we don't want individual VC's to show up, instead they will
				// show up in the VC page.
				// identify and sort items without a particular phase defined...
				s.phaseArray = [];
				PhaseBaseModel.all()
				.then(function (p) {
					s.phaseArray.push({id: 'Any Phase', title: 'Any Phase'}); // identify and sort items without a particular phase defined...

					_.forEach(p, function (item) {
						s.phaseArray.push({id: item.name, title: item.name});
					});
				});
				ArtifactModel.forProjectFilterType($scope.project._id, "isPublished=" + $scope.published + "&typeCodeNe=valued-component,inspection-report")
				.then(function (c) {
					// quickly surface up the current stage...
					_.each(c, function(a) {
						var currentStage = (a.artifactType && a.artifactType.stages) ? _.find(a.artifactType.stages, function(s) { return s.name === a.stage; }) : undefined;
						a.stageRole = (currentStage && currentStage.role) ? currentStage.role : '';
					});

					var parms = {count: 10, sorting: {}};
					if (s.published) {
						// some default sorting for the published content...
						parms.sorting = {dateUpdated: 'desc'};
					}
					s.tableParams = new NgTableParams(parms, {dataset: c});

					// console.log ("artifacts = ", c);
					s.showFilter = c && c.length > 0;
					// no content message...
					if (!c || c.length === 0) {
						if (s.published) {
							s.noDataMessage = "There is no Published Content at this time.";
						} else {
							s.noDataMessage = (s.public) ? "There is no In Progress Content at this time." : "There is no In Progress Content at this time. To add content, click on the 'Add Content' button.";
						}
					}
					if (s.showFilter) {
						// build out the filter arrays...
						var recs = _(angular.copy(c)).chain().flatten();
						recs.pluck('version').unique().value().map(function (item) {
							s.versionArray.push({id: item, title: item});
						});
						recs.pluck('stage').unique().value().map(function (item) {
							s.stageArray.push({id: item, title: item});
						});
					}
					$scope.$apply();
				});

			};

			s.init();
		},
		controllerAs: 's'
	};
})
// -------------------------------------------------------------------------
//
// this wraps up the complete display of an artifact, either a template or
// a document type, in either edit or view mode for each
//
// -------------------------------------------------------------------------
.directive('tmplArtifactDisplay', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/artifacts/client/views/artifact-display.html',
		scope: {
			project: '=',
			artifact: '=',
			mode: '='
		},
		controller: function ($scope, Authentication, ArtifactModel, VcModel, _) {
			$scope.authentication = Authentication;
			$scope.removeVCArtifact = function (obj) {
				// We've been asked to remove this VC artifact from the VC artifact collection
				var mainArtifact = obj.mainArtifact;
				var vcArtifact = obj.vcArtifact;
				// Remove it from the main
				ArtifactModel.lookup(mainArtifact)
				.then(function (item) {
					var index = _.findIndex(item.valuedComponents, function (o) {
						return vcArtifact === o._id;
					});
					if (index !== -1) {
						// Remove it from the main
						// console.log("index:", index);
						item.valuedComponents.splice(index, 1);
						$scope.artifact = item;
						$scope.$apply();
					}
				});
			};
		}
	};
})
.directive('tmplArtifactVcList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/artifacts/client/views/artifact-display-vc-list.html',
		scope: {
			project: '=',
			artifact: '=',
			mode: '='
		}
	};
})
.directive('tmplArtifactVcEdit', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/artifacts/client/views/artifact-display-vc-edit.html',
		scope: {
			project: '=',
			artifact: '=',
			mode: '='
		},
		controller: function ($scope, $state, VcModel, ArtifactModel) {
			// Set the other fields to the VC model
			VcModel.lookup($scope.artifact.valuedComponents[0]._id)
			.then(function (vc) {
				$scope.vc = vc;
				$scope.$apply();
			});
			$scope.save = function () {
				if ($scope.artifact) {
					VcModel.saveModel($scope.vc)
					.then(function (vc) {
						return ArtifactModel.lookup($scope.artifact._id);
					})
					.then(function (art) {
						// console.log("art: ", art);
						// Update the name of the artifact appropriately
						art.name = $scope.vc.title;
						return ArtifactModel.saveModel(art);
					})
					.then(function () {
						$state.go('p.vc.list', {reload: true});
					});
				}
			};
		}
	};
})
// -------------------------------------------------------------------------
//
// this wraps up the complete display of an artifact, either a template or
// a document type, in either edit or view mode for each
//
// -------------------------------------------------------------------------
.directive('artifactDisplayModal', function ($modal) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			artifact: '=',
			mode: '='
		},
		link: function (scope, element, attrs) {
			element.on('click', function () {
				$modal.open({
					animation: true,
					templateUrl: 'modules/artifacts/client/views/artifact-display-modal.html',
					size: 'lg',
					controller: function ($scope, $modalInstance) {
						$scope.project = scope.project;
						$scope.artifact = scope.artifact;
						$scope.mode = scope.mode;
						$scope.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
					}
				});
			});
		}
	};
})
// -------------------------------------------------------------------------
//
// a modal directive with isolated scope for viewing and
// interacting with a list of artifacts in order to choose one.
// so, essentially an artifact chooser
//
// -------------------------------------------------------------------------
.directive('artifactChooser', function ($modal, ArtifactModel, _) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			artifact: '='
		},
		link: function (scope, element, attrs) {
			element.on('click', function () {
				$modal.open({
					animation: true,
					templateUrl: 'modules/artifacts/client/views/artifact-chooser.html',
					controllerAs: 's',
					size: 'md',
					resolve: {
						artifacts: function (ArtifactModel) {
							return ArtifactModel.forProject(scope.project._id);
						}
					},
					controller: function ($scope, $modalInstance, artifacts) {
						var s = this;
						s.artifacts = artifacts;
						s.selected = scope.artifact._id;
						s.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
						s.ok = function () {
							$modalInstance.close(s.selected);
						};
					}
				})
				.result.then(function (data) {
					if (!(scope.artifact._id && scope.artifact._id === data)) {
						scope.artifact._id = data;
						// console.log ('new artifact is', scope.artifact._id);
					}
				})
				.catch(function (err) {
				});
			});
		}
	};
})
.directive('artifactVc', function ($modal, ArtifactModel, _, VcModel) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			artifact: '=',
			current: '='
		},
		link: function (scope, element, attrs) {
			element.on('click', function () {
				$modal.open({
					animation: true,
					templateUrl: 'modules/artifacts/client/views/artifact-vc.html',
					controllerAs: 's',
					size: 'md',
					resolve: {
						artifacts: function (ArtifactModel) {
							// console.log("resolving artifacts");
							return ArtifactModel.forProjectGetType(scope.project._id, "valued-component");
						}
					},
					controller: function ($scope, $modalInstance, artifacts) {
						var s = this;
						s.artifacts = artifacts;
						// console.log("current:",scope.current);
						s.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
						s.ok = function () {
							// Selected artifact is:
							// console.log("Selected:",s.selected);
							$modalInstance.close(s.selected);
						};
					}
				})
				.result.then(function (data) {
					// References the selected id of the VC artifact to add to the VC package
					// console.log("vc id:",data);
					ArtifactModel.lookup(data)
					.then(function (vcartifact) {
						// console.log("artifactvc:",vcartifact);
						var vc = vcartifact.valuedComponents[0];
						var found = _.find(scope.current.valuedComponents, function (item) {
							return item.artifact === data;
						});
						if (!found) {
							scope.current.valuedComponents.push(vc);
						}
					});
				})
				.catch(function (err) {
				});
			});
		}
	};
})
.directive ('artifactListChooser', function ($modal, ArtifactModel, _) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			current: '=',
			removevcs: "="
		},
		link : function(scope, element, attrs) {
			element.on('click', function () {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/artifacts/client/views/artifact-list-chooser.html',
					controllerAs: 's',
					size: 'lg',
					resolve: {
						items: function (ArtifactModel, _) {
							return ArtifactModel.forProject (scope.project._id)
							.then( function (data) {
								// Filter out the inspection report templates.  Additionally
								// filter vcs if required
								_.remove(data, function (item) {
									if (scope.removevcs && item.typeCode === 'valued-component') {
										return item;
									} else if (item.typeCode === 'inspection-report') {
										return item;
									}
								});
								return data;
							});
						}
					},
					controller: function ($scope, $modalInstance, items) {
						var s = this;

						var isArray = _.isArray(scope.current);

						s.items = items;
						s.selected = scope.current;
						s.selected = [];

						s.isSelected = function(id) {
							var item =  _.find(s.selected, function(o) { return o._id === id; });
							return !_.isEmpty(item);
						};

						s.select = function(id) {
							var item =  _.find(s.selected, function(o) { return o._id === id; });
							if (item) {
								_.remove(s.selected, function(o) { return o._id === id; });
							} else {
								var existingItem = _.find(s.items, function(o) { return o._id === id; });
								if (!_.isEmpty(existingItem)) {
									if (isArray) {
										s.selected.push(existingItem);
									} else {
										s.selected = [existingItem];
									}
								}
							}
						};

						s.cancel = function () { $modalInstance.dismiss ('cancel'); };

						s.ok = function () {
							$modalInstance.close (s.selected);
						};

						// if current, then we need to select
						if (scope.current) {
							if (isArray) {
								_.forEach(scope.current, function(o) {
									s.select(o._id);
								});
							} else {
								s.select(scope.current._id);
							}
						}
					}
				}).result.then (function (data) {
					if (_.isArray(scope.current)) {
						scope.current = data;
					} else {
						scope.current = data[0];
					}
					//console.log('Artifact List Chooser.selected = ', JSON.stringify(scope.current, 4, null));
				})
					.catch (function (err) {});
			});
		}
	};
})
;
