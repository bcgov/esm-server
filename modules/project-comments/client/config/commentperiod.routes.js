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
				// Temporary redirect to PCP for these two projects
				if (project.code === 'aurora-lng-digby-island') {
					window.location = "http://www.eao.gov.bc.ca/pcp/comments/aurora_digby_comments.html";
					return null;
				} else if (project.code === 'kemess-underground') {
					window.location = "http://www.eao.gov.bc.ca/pcp/comments/kemess_underground_comments.html";
					return null;
				}

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
		controller: function ($timeout, $scope, $state, project, period, CommentPeriodModel, _) {
			createEditCommonSetup($timeout, $scope, _, period, project);

			$scope.hasErrors = false;
			//$scope.errorMessage = '';

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

			defineDocumentMgr($scope, _);

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
		controller: function ($timeout, $scope, $state, period, project, CommentPeriodModel, CommentModel, _) {
			// only public comments for now...
			period.periodType = 'Public';
			period.commenterRoles = ['public'];

			createEditCommonSetup($timeout, $scope, _, period, project);

			$scope.hasErrors = false;
			$scope.errorMessage = '';

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

			defineDocumentMgr($scope, _);

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

	function createEditCommonSetup($timeout, $scope, _, period, project) {
		$scope.period = period;
		$scope.project = project;
		$scope.changeType = function () {
			if (period.periodType === 'Public') {
				period.commenterRoles = ['public'];
			} else {
				period.commenterRoles = [];
			}
		};
		_.each($scope.period.relatedDocuments, function(d) {
			if (_.isEmpty(d.displayName)) {
				d.displayName = d.documentFileName || d.internalOriginalName;
			}
		});

		$scope.addLinkedFiles = function(data) { addLinkedFiles($scope, _, data);	};

		$scope.removeDocument = function(doc) {
			_.remove($scope.period.relatedDocuments, doc);
			$scope.documentMgr.applySort();
		};

		// manage the start and end dates plus the controls that set period length based on presets (e.g. 30, 45, etc days)
		setupPeriodOptions($scope, _);

		// initialize the period controls
		typeChange($scope, _);

		// on change to start date or end date via date picker...
		$scope.$on('modalDatePicker.onChange', function () {
			periodChange($scope, _);
		});
	}

	function defineDocumentMgr($scope, _) {
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
	}

	function addLinkedFiles($scope, _, data) {
		var period = $scope.period;
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
	}

	function setupPeriodOptions($scope, _) {

		$scope.pTypes = [
			{displayName: "Start Day", value: "start"},
			{displayName: "End Day", value: "end"},
			{displayName: "Custom", value: "custom"}
		];
		$scope.pType = $scope.pTypes[0];
		$scope.typeChange = function () {
			typeChange($scope, _);
		};

		$scope.pOptions = [
			{displayName: "30 days", value: "30"},
			{displayName: "45 days", value: "45"},
			{displayName: "60 days", value: "60"},
			{displayName: "75 days", value: "75"}
		];
		$scope.pOption = $scope.pOptions[0];
		$scope.periodChange = function () {
			periodChange($scope, _);
		};
	}

	function typeChange($scope, _) {
		var type = $scope.pType.value;
		$scope.endPickerEnabled = true;
		$scope.startPickerEnabled = true;
		$scope.rangePickerEnabled = true;
		switch (type) {
			case 'start':
				$scope.endPickerEnabled = false;
				break;
			case 'end':
				$scope.startPickerEnabled = false;
				break;
			case 'custom':
				$scope.rangePickerEnabled = false;
		}
		periodChange($scope, _);
	}

	function periodChange($scope, _) {
		var type = $scope.pType.value;
		var period = $scope.period;
		var numberOfDaysToAdd = 1 * $scope.pOption.value; // convert to number
		numberOfDaysToAdd--; // decrease by one. The start and end dates are part of the period
		switch (type) {
			case 'start':
				// derive the end date based on start date and number of days
				if (period.dateStarted) {
					var sDate = new Date(period.dateStarted);
					sDate.setDate(sDate.getDate() + numberOfDaysToAdd);
					period.dateCompleted = sDate;
				} else {
					period.dateCompleted = undefined;
				}
				break;
			case 'end':
				// derive the start date based on end date and subtract number of days
				if (period.dateCompleted) {
					var eDate = new Date(period.dateCompleted);
					eDate.setDate(eDate.getDate() - numberOfDaysToAdd);
					period.dateStarted = eDate;
				} else {
					period.dateStarted = undefined;
				}
				break;
			case 'custom':
			// no op
		}
	}

}]);











