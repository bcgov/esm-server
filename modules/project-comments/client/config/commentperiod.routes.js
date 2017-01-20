'use strict';
// =========================================================================
//
// comment period routes
//
// =========================================================================
angular.module('comment').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for comment periods.
	// since it is a child of p (project), the project injection has already
	// been resolved and is available to subsequent child states as 'project'
	// here we will resolve the list of periods for this project, which will
	// also become available to child states as 'periods'
	//
	// -------------------------------------------------------------------------
	.state('p.commentperiod', {
		abstract:true,
		url: '/commentperiod',
		template: '<ui-view class="comment-period-view"></ui-view>',
		resolve: {
			periods: function ($stateParams, CommentPeriodModel, project) {
				return CommentPeriodModel.forProject (project._id);
			}
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for comment periods, project and periods are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('p.commentperiod.list', {
		url: '/list',
		templateUrl: 'modules/project-comments/client/views/period-list.html',
		resolve: {
			periods: function ($stateParams, CommentPeriodModel, project) {
				return CommentPeriodModel.forProjectWithStats (project._id);
			}
		},
		controller: function ($scope, $state, NgTableParams, periods, project, _, moment, CommentPeriodModel, AlertService) {
			var s = this;
			//console.log ('periods = ', periods);
			var ps = _.map(periods, function(p) {
				var openForComment = moment(moment.now()).isBetween(p.dateStarted, p.dateCompleted);
				return _.extend(p, {openForComment: openForComment});
			});
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: ps});
			$scope.project = project;

			// filter lists...
			s.typeArray = [];
			s.phaseArray = [];

			// build out the filter arrays...
			var recs = _(angular.copy(ps)).chain().flatten();
			recs.pluck('periodType').unique().value().map(function (item) {
				s.typeArray.push({id: item, title: item});
			});
			recs.pluck('phaseName').unique().value().map(function (item) {
				s.phaseArray.push({id: item, title: item});
			});

			s.deletePeriod = function(p) {
				return CommentPeriodModel.removePeriod(p)
					.then(
						function(result) {
							$state.reload();
							AlertService.success('Comment Period was deleted!');
						},
						function(error){
							$state.reload();
							AlertService.error('Comment Period could not be deleted.');
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
	.state('p.commentperiod.create', {
		url: '/create',
		templateUrl: 'modules/project-comments/client/views/period-edit.html',
		resolve: {
			period: function (CommentPeriodModel) {
				return CommentPeriodModel.getNew ();
			}
		},
		onEnter: function($state, project){
			// can't use data.permissions, as project is not loaded
			// so check this now before we get into the controller...
			if (!project.userCan.createCommentPeriod) {
				$state.go('forbidden');
			}
		},
		controller: function ($scope, $state, project, period, CommentPeriodModel, _) {
			$scope.period = period;
			$scope.project = project;
			$scope.changeType = function () {
				if (period.periodType === 'Public') {
					period.commenterRoles = ['public'];
				} else {
					period.commenterRoles = [];
				}
			};
			$scope.hasErrors = false;
			//$scope.errorMessage = '';

			_.each($scope.period.relatedDocuments, function(d) {
				if (_.isEmpty(d.displayName)) {
					d.displayName = d.documentFileName || d.internalOriginalName;
				}
			});

			$scope.addLinkedFiles = function(data) {
				// add files in data to our relatedDocs
				if (data) {
					_.each(data, function(d) {
						var f = _.find(period.relatedDocuments, function(r) { return r._id.toString() === d._id.toString(); });
						if (!f) {
							//ok, add this to the list.
							if (_.isEmpty(d.displayName)) {
								d.displayName = d.documentFileName || d.internalOriginalName;
							}
							period.relatedDocuments.push(d);
						}
					});
					$scope.documentMgr.applySort();
				}
			};

			$scope.removeDocument = function(doc) {
				_.remove($scope.period.relatedDocuments, doc);
				$scope.documentMgr.applySort();
			};

			$scope.save = function () {
				if (_.size($scope.period.commenterRoles) === 0 || _.size($scope.period.vettingRoles) === 0 || _.size($scope.period.classificationRoles) === 0) {
					$scope.hasErrors = true;
					//$scope.errorMessage = 'Post, Vet and Classify Comments roles are all required. See Roles & Permissions tab.';
				} else {
					period.project = project._id;
					
					period.phase = project.currentPhase;
					period.phaseName = project.currentPhase.name;

					CommentPeriodModel.add($scope.period)
					.then(function (model) {
						$state.transitionTo('p.commentperiod.list', {projectid: project.code}, {
							reload: true, inherit: false, notify: true
						});
					})
					.catch(function (err) {
						console.error(err);
						// alert (err.message);
					});
				}
			};

			$scope.documentMgr = {
				sortedFiles: $scope.period.relatedDocuments,
				sorting: {
					column: 'name',
					ascending: true
				},
				sortBy: function (column) {
					//is this the current column?
					if ($scope.documentMgr.sorting.column.toLowerCase() === column.toLowerCase()) {
						//so we reverse the order...
						$scope.documentMgr.sorting.ascending = !$scope.documentMgr.sorting.ascending;
					} else {
						// changing column, set to ascending...
						$scope.documentMgr.sorting.column = column.toLowerCase();
						$scope.documentMgr.sorting.ascending = true;
					}
					$scope.documentMgr.applySort();
				},
				applySort: function () {
					// sort ascending first...
					$scope.documentMgr.sortedFiles = _.sortBy($scope.period.relatedDocuments, function (f) {
						// more making sure that the displayName is set...
						if (_.isEmpty(f.displayName)) {
							f.displayName = f.documentFileName || f.internalOriginalName;
						}

						if ($scope.documentMgr.sorting.column === 'name') {
							return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
						} else if ($scope.documentMgr.sorting.column === 'author') {
							return _.isEmpty(f.documentAuthor) ? null : f.documentAuthor.toLowerCase();
						} else if ($scope.documentMgr.sorting.column === 'type') {
							return _.isEmpty(f.internalExt) ? null : f.internalExt.toLowerCase();
						} else if ($scope.documentMgr.sorting.column === 'size') {
							return _.isEmpty(f.internalExt) ? 0 : f.internalSize;
						} else if ($scope.documentMgr.sorting.column === 'date') {
							//date uploaded
							return _.isEmpty(f.dateUploaded) ? 0 : f.dateUploaded;
						} else if ($scope.documentMgr.sorting.column === 'pub') {
							//is published...
							return !f.isPublished;
						}
						// by name if none specified... or we incorrectly identified...
						return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
					});

					if (!$scope.documentMgr.sorting.ascending) {
						// and if we are not supposed to be ascending... then reverse it!
						$scope.documentMgr.sortedFiles = _($scope.documentMgr.sortedFiles).reverse().value();
					}

				}
			};

			$scope.documentMgr.applySort();

			$scope.changeType ();
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('p.commentperiod.edit', {
		url: '/:periodId/edit',
		templateUrl: 'modules/project-comments/client/views/period-edit.html',
		resolve: {
			period: function ($stateParams, CommentPeriodModel) {
				// console.log ('editing periodId = ', $stateParams.periodId);
				return CommentPeriodModel.getForPublic ($stateParams.periodId);
			}
		},
		onEnter: function($state, project){
			// can't use data.permissions, as project is not loaded
			// so check this now before we get into the controller...
			if (!project.userCan.createCommentPeriod) {
				$state.go('forbidden');
			}
		},
		controller: function ($scope, $state, period, project, CommentPeriodModel, CommentModel, _) {
			// only public comments for now...
			period.periodType = 'Public';
			period.commenterRoles = ['public'];

			$scope.period = period;
			$scope.project = project;

			_.each($scope.period.relatedDocuments, function(d) {
				if (_.isEmpty(d.displayName)) {
					d.displayName = d.documentFileName || d.internalOriginalName;
				}
			});


			$scope.changeType = function () {
				if (period.periodType === 'Public') {
					period.commenterRoles = ['public'];
				} else {
					period.commenterRoles = [];
				}
			};
			
			$scope.hasErrors = false;
			$scope.errorMessage = '';

			$scope.addLinkedFiles = function(data) {
				// add files in data to our relatedDocs
				if (data) {
					_.each(data, function(d) {
						var f = _.find(period.relatedDocuments, function(r) { return r._id.toString() === d._id.toString(); });
						if (!f) {
							//ok, add this to the list.
							if (_.isEmpty(d.displayName)) {
								d.displayName = d.documentFileName || d.internalOriginalName;
							}
							period.relatedDocuments.push(d);
						}
					});
					$scope.documentMgr.applySort();
				}
			};

			$scope.removeDocument = function(doc) {
				_.remove($scope.period.relatedDocuments, doc);
				$scope.documentMgr.applySort();
			};

			$scope.save = function () {
				if (_.size($scope.period.commenterRoles) === 0 || _.size($scope.period.vettingRoles) === 0 || _.size($scope.period.classificationRoles) === 0) {
					$scope.hasErrors = true;
					$scope.errorMessage = 'Post, Vet and Classify Comments roles are all required.  See Roles & Permissions tab.';
				} else {
					CommentPeriodModel.save($scope.period)
					.then(function (model) {
						// console.log ('period was saved',model);
						// save the comments so that we pick up the (potential) changes to the period permissions...
						return CommentModel.getAllCommentsForPeriod(model._id);
					})
					.then(function (comments) {
						Promise.resolve()
						.then(function () {
							return comments.reduce(function (current, value, index) {
								return CommentModel.save(value);
							}, Promise.resolve());
						});
					}).then(function () {
						$state.transitionTo('p.commentperiod.list', {projectid: project.code}, {
							reload: true, inherit: false, notify: true
						});
					})
					.catch(function (err) {
						console.error(err);
						// alert (err.message);
					});
				}
			};

			$scope.documentMgr = {
				sortedFiles: $scope.period.relatedDocuments,
				sorting: {
					column: 'name',
					ascending: true
				},
				sortBy: function (column) {
					//is this the current column?
					if ($scope.documentMgr.sorting.column.toLowerCase() === column.toLowerCase()) {
						//so we reverse the order...
						$scope.documentMgr.sorting.ascending = !$scope.documentMgr.sorting.ascending;
					} else {
						// changing column, set to ascending...
						$scope.documentMgr.sorting.column = column.toLowerCase();
						$scope.documentMgr.sorting.ascending = true;
					}
					$scope.documentMgr.applySort();
				},
				applySort: function () {
					// sort ascending first...
					$scope.documentMgr.sortedFiles = _.sortBy($scope.period.relatedDocuments, function (f) {
						// more making sure that the displayName is set...
						if (_.isEmpty(f.displayName)) {
							f.displayName = f.documentFileName || f.internalOriginalName;
						}

						if ($scope.documentMgr.sorting.column === 'name') {
							return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
						} else if ($scope.documentMgr.sorting.column === 'author') {
							return _.isEmpty(f.documentAuthor) ? null : f.documentAuthor.toLowerCase();
						} else if ($scope.documentMgr.sorting.column === 'type') {
							return _.isEmpty(f.internalExt) ? null : f.internalExt.toLowerCase();
						} else if ($scope.documentMgr.sorting.column === 'size') {
							return _.isEmpty(f.internalExt) ? 0 : f.internalSize;
						} else if ($scope.documentMgr.sorting.column === 'date') {
							//date uploaded
							return _.isEmpty(f.dateUploaded) ? 0 : f.dateUploaded;
						} else if ($scope.documentMgr.sorting.column === 'pub') {
							//is published...
							return !f.isPublished;
						}
						// by name if none specified... or we incorrectly identified...
						return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
					});

					if (!$scope.documentMgr.sorting.ascending) {
						// and if we are not supposed to be ascending... then reverse it!
						$scope.documentMgr.sortedFiles = _($scope.documentMgr.sortedFiles).reverse().value();
					}

				}
			};

			$scope.documentMgr.applySort();
			$scope.changeType ();
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a comment period. here we are just simply
	// looking at the information for this specific object
	//
	// ** this is where we should go to the view of the comments
	//
	// -------------------------------------------------------------------------
	.state('p.commentperiod.detail', {
		url: '/:periodId',
		templateUrl: 'modules/project-comments/client/views/period-view.html',
		resolve: {
			period: function ($stateParams, CommentPeriodModel) {
				return CommentPeriodModel.getForPublic ($stateParams.periodId);
			}
		},
		controller: function ($scope, period, project, _) {
			//console.log ('period user can: ', JSON.stringify(period.userCan, null, 4));
			var self = this;
			var today       = new Date ();
			var start       = new Date (period.dateStarted);
			var end         = new Date (period.dateCompleted);
			var isopen      = start < today && today < end;
			$scope.isOpen   = isopen;
			$scope.isBefore = (start > today);
			$scope.isClosed = (end < today);
			$scope.period   = period;
			$scope.project  = project;
			// anyone with vetting comments can add a comment at any time
			// all others with add comment permission must wait until the period is open
			$scope.allowCommentSubmit = (isopen && period.userCan.addComment) || period.userCan.vetComments;

			$scope.documentMgr = {
				sortedFiles: $scope.period.relatedDocuments,
				sorting: {
					column: 'name',
					ascending: true
				},
				sortBy: function (column) {
					//is this the current column?
					if ($scope.documentMgr.sorting.column.toLowerCase() === column.toLowerCase()) {
						//so we reverse the order...
						$scope.documentMgr.sorting.ascending = !$scope.documentMgr.sorting.ascending;
					} else {
						// changing column, set to ascending...
						$scope.documentMgr.sorting.column = column.toLowerCase();
						$scope.documentMgr.sorting.ascending = true;
					}
					$scope.documentMgr.applySort();
				},
				applySort: function () {
					// sort ascending first...
					$scope.documentMgr.sortedFiles = _.sortBy($scope.period.relatedDocuments, function (f) {
						// more making sure that the displayName is set...
						if (_.isEmpty(f.displayName)) {
							f.displayName = f.documentFileName || f.internalOriginalName;
						}

						if ($scope.documentMgr.sorting.column === 'name') {
							return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
						} else if ($scope.documentMgr.sorting.column === 'author') {
							return _.isEmpty(f.documentAuthor) ? null : f.documentAuthor.toLowerCase();
						} else if ($scope.documentMgr.sorting.column === 'type') {
							return _.isEmpty(f.internalExt) ? null : f.internalExt.toLowerCase();
						} else if ($scope.documentMgr.sorting.column === 'size') {
							return _.isEmpty(f.internalExt) ? 0 : f.internalSize;
						} else if ($scope.documentMgr.sorting.column === 'date') {
							//date uploaded
							return _.isEmpty(f.dateUploaded) ? 0 : f.dateUploaded;
						} else if ($scope.documentMgr.sorting.column === 'pub') {
							//is published...
							return !f.isPublished;
						}
						// by name if none specified... or we incorrectly identified...
						return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
					});

					if (!$scope.documentMgr.sorting.ascending) {
						// and if we are not supposed to be ascending... then reverse it!
						$scope.documentMgr.sortedFiles = _($scope.documentMgr.sortedFiles).reverse().value();
					}

				}
			};

			$scope.documentMgr.applySort();
		}
	})

	;

}]);











