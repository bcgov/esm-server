'use strict';
// =========================================================================
//
// comment period routes
//
// =========================================================================
angular.module('comment').config(['$stateProvider', 'moment', "_", function ($stateProvider, moment, _) {
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
			},
			activeperiod: function ($stateParams, CommentPeriodModel, project) {
				// Go through the periods on the project, surface the active one and enable commenting
				// right from here.
				// The following code is copied from project.client.routes.js
				return CommentPeriodModel.forProject (project._id)
					.then( function (periods) {
						var openPeriod = null;
						_.each(periods, function (period) {
							if (period.openState.state === CommentPeriodModel.OpenStateEnum.open) {
								openPeriod = period;
								return false;
							}
						});
						if (openPeriod) {
							// console.log("Found open period:", openPeriod);
							return openPeriod;
						} else {
							return null;
						}
					});
			}
		},
		controller: function ($scope, $state, NgTableParams, periods, activeperiod, project, CommentPeriodModel, AlertService) {
			var s = this;
			//console.log ('periods = ', periods);
			$scope.activeperiod = null;
			if (activeperiod) {
				// Switch on the UI for comment period
				// console.log("activeperiod:", activeperiod);
				$scope.activeperiod = activeperiod;
				$scope.allowCommentSubmit = (activeperiod.userCan.addComment) || activeperiod.userCan.vetComments;
			}
			var ps = _.map(periods, function(p) {
				var openForComment = p.openState.state === CommentPeriodModel.OpenStateEnum.open;
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

			s.publishCommentPeriod = function(p) {
				return CommentPeriodModel.publishCommentPeriod(p)
					.then(
						function(result) {
							$state.reload();
							AlertService.success('Comment Period was published!');
						},
						function(error){
							$state.reload();
							AlertService.error('Comment Period could not be published.');
						});
			};
			s.unpublishCommentPeriod = function(p) {
				return CommentPeriodModel.unpublishCommentPeriod(p)
					.then(
						function(result) {
							$state.reload();
							AlertService.success('Comment Period was unpublished!');
						},
						function(error){
							$state.reload();
							AlertService.error('Comment Period could not be unpublished.');
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
		controller: function ($timeout, $scope, $state, project, period, CommentPeriodModel, CodeLists) {
			createEditCommonSetup($timeout, $scope, period, project, CodeLists, CommentPeriodModel);

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

			defineDocumentMgr($scope);

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
		controller: function ($timeout, $scope, $state,  period, project, CommentPeriodModel, CommentModel, CodeLists) {
			// only public comments for now...
			period.periodType = 'Public';
			period.commenterRoles = ['public'];

			// store these, if they change, we need to update all child comment permissions...
			var originalPeriodRoles = {
				read: period.read,
				write: period.write,
				delete: period.delete,
				commenterRoles: period.commenterRoles,
				vettingRoles: period.vettingRoles,
				classificationRoles: period.classificationRoles
			};

			var rolesChanged = function(period) {
				var periodRoles = {
					read: period.read,
					write: period.write,
					delete: period.delete,
					commenterRoles: period.commenterRoles,
					vettingRoles: period.vettingRoles,
					classificationRoles: period.classificationRoles
				};
				return (JSON.stringify(originalPeriodRoles) !== JSON.stringify(periodRoles));
			};

			createEditCommonSetup($timeout, $scope, period, project, CodeLists);

			// ESM-761: for edit - don't show project-system-admin roles for vet and classify..
			period.vettingRoles = _.without(period.vettingRoles, 'project-system-admin');
			period.classificationRoles = _.without(period.classificationRoles, 'project-system-admin');

			$scope.busy = false;
			$scope.hasErrors = false;
			$scope.errorMessage = '';

			$scope.save = function () {
				if (_.size($scope.period.commenterRoles) === 0 || _.size($scope.period.vettingRoles) === 0 || _.size($scope.period.classificationRoles) === 0) {
					$scope.hasErrors = true;
					$scope.errorMessage = 'Post, Vet and Classify Comments roles are all required.  See Roles & Permissions tab.';
				} else {
					$scope.busy = true;

					CommentPeriodModel.save($scope.period)
					.then(function (model) {
						if (!rolesChanged(model)) {
							return;
						} else {
							// console.log ('period was saved, roles changed');
							// save the comments so that we pick up the (potential) changes to the period permissions...
							return CommentModel.commentPeriodCommentsSync(project._id, model._id, period.stats.total);
						}
					}).then(function () {
						$scope.busy = false;
						$state.transitionTo('p.commentperiod.list', {projectid: project.code}, {
							reload: true, inherit: false, notify: true
						});
					})
					.catch(function (err) {
						$scope.busy = false;
						console.error(err);
						// alert (err.message);
					});
				}
			};

			defineDocumentMgr($scope);

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
		controller: function ($scope, period, project) {
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
			// convert instructions to displayable HTML
			$scope.aboutThisPeriod = period.instructions.replace(/\n/g,"<br>");
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

	function createEditCommonSetup($timeout, $scope, period, project, CodeLists, CommentPeriodModel) {
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

		$scope.addLinkedFiles = function(data) { addLinkedFiles($scope, data);	};

		$scope.removeDocument = function(doc) {
			_.remove($scope.period.relatedDocuments, doc);
			$scope.documentMgr.applySort();
		};

		// manage the start and end dates plus the controls that set period length based on presets (e.g. 30, 45, etc days)
		setupPeriodOptions($scope);

		// initialize the period controls
		typeChange($scope);

		// on change to start date or end date via date picker...
		$scope.$on('modalDatePicker.onChange', function () {
			periodChange($scope);
		});

		$scope.$watchGroup(['period.dateStarted', 'period.dateCompleted','period.additionalText','period.informationLabel'], function() {
			instructions(project, period, CommentPeriodModel);
		});
	}

	function instructions(project, period, CommentPeriodModel) {
		var template = "Comment Period on the %INFORMATION_LABEL% for the %PROJECT_NAME% Project. This comment period %DATE_RANGE%.";

		var PROJECT_NAME = project.name || '%PROJECT_NAME%';
		var INFORMATION_LABEL = period.informationLabel || '%INFORMATION_LABEL%';
		var DATE_RANGE = '%DATE_RANGE%';

		if (period.dateStarted && period.dateCompleted) {
			var today = new Date();
			var start = new Date(period.dateStarted);
			var end = new Date(period.dateCompleted);
			var isOpen = start <= today && today <= end;
			if (isOpen) {
				DATE_RANGE = "is open from ";
			} else {
				if (today < start) {
					DATE_RANGE = "will open on ";
				} else if (today > end) {
					DATE_RANGE = "was open from ";
				}
			}
			DATE_RANGE += moment(period.dateStarted).format("MMMM Do YYYY") +
				' to ' + moment(period.dateCompleted).format("MMMM Do YYYY");
		}

		period.instructions = template.replace('%PROJECT_NAME%', PROJECT_NAME)
			.replace('%INFORMATION_LABEL%', INFORMATION_LABEL)
			.replace('%DATE_RANGE%', DATE_RANGE);
		if (period.additionalText) {
			period.instructions += "\n" + period.additionalText;
		}
	}

	function defineDocumentMgr($scope) {
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

	function addLinkedFiles($scope, data) {
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

	/*
	 * For both create and edit setup the period and UI elements
	 */
	function setupPeriodOptions($scope) {
		// from the model
		// rangeType        : { type:String, default:null, enum:['start', 'end', 'custom']},
		// rangeOption      : { type:String, default:null, enum:['30', '45', '60', '75', 'custom']},
		var period = $scope.period;
		var rangeTypes = [
			{displayName: "Start Day", value: "start"},
			{displayName: "End Day", value: "end"},
			{displayName: "Custom", value: "custom"}
		];
		var rangeOptions = [
			{displayName: "30 days", value: "30"},
			{displayName: "45 days", value: "45"},
			{displayName: "60 days", value: "60"},
			{displayName: "75 days", value: "75"},
			{displayName: "", value: "custom"}
		];
		$scope.rangeTypes = rangeTypes;
		$scope.rangeOptions = rangeOptions;
		$scope.typeChange = function () {
			typeChange($scope);
		};
		$scope.periodChange = function () {
			periodChange($scope);
		};

		// if new or old instance of period prior to adding range
		if (!period.rangeType || !period.rangeOption) {
			period.rangeType = 'custom';
			period.rangeOption = 'custom';
			//console.log("defaulting on type and range ");
		}

		// UI elements .. set to match model values
		$scope.rType = _.find(rangeTypes, function(t) { return t.value === period.rangeType; });
		// note need to force conversion to number for === to work
		$scope.rOption = _.find(rangeOptions, function(o) { return ( o.value === (''+period.rangeOption)); });
	}

	/**
	 * UI allows user to set the end date based on start date, or the reverse, or custom start-to-end.
	 * This handler enables UI controls based on the selected type and fires the periodChange handler.
	 */
	function typeChange($scope) {
		// get value from UI
		var type = $scope.rType.value;
		var period = $scope.period;
		// store UI set value into model
		var isChanged = period.rangeType !== $scope.rType.value;
		period.rangeType = type;

		var defaultOption = $scope.rangeOptions[0]; // 30 days
		var customOption = $scope.rangeOptions[4];

		$scope.endPickerEnabled = true;
		$scope.startPickerEnabled = true;
		$scope.rangePickerEnabled = true;
		switch (type) {
			case 'start':
				$scope.endPickerEnabled = false;
				if(isChanged) $scope.rOption = defaultOption;
				break;
			case 'end':
				$scope.startPickerEnabled = false;
				if(isChanged) $scope.rOption = defaultOption;
				break;
			case 'custom':
				$scope.rangePickerEnabled = false;
				if(isChanged) $scope.rOption = customOption;
		}
		periodChange($scope);
	}

	/**
	 * Recompute the start / end dates based on UI changes
	 *
	 */
	function periodChange($scope) {
		// get value from UI
		var rOption = $scope.rOption.value;
		// store UI set value into model
		var period = $scope.period;
		period.rangeOption = rOption;

		var type = period.rangeType;

		// add X number of days based on (a) but preserve the time in the original (b)
		function computeDate(a, b, numberOfDaysToAdd) {
			if (!a)
				return undefined;
			var savedTime;
			if (b) {
				var mb = moment(b);
				savedTime = {hour: mb.hour(), minute: mb.minute(), second: mb.second()};
			}
			var ms = moment(a);
			ms.add(numberOfDaysToAdd, 'days');
			if (savedTime) {
				ms.hour(savedTime.hour).minute(savedTime.minute).second(savedTime.second);
			}
			return ms.toDate();
		}

		// Convert to number when type is not "custom". Period includes start and end date subtract one
		var numberOfDaysToAdd;
		switch (type) {
			case 'start':
				numberOfDaysToAdd = (rOption - 1);
				period.dateCompleted = computeDate(period.dateStarted, period.dateCompleted, numberOfDaysToAdd);
				break;
			case 'end':
				numberOfDaysToAdd = -1 * (rOption - 1);
				period.dateStarted = computeDate(period.dateCompleted, period.dateStarted, numberOfDaysToAdd);
				break;
			case 'custom':
			// no op
		}
	}

}]);











