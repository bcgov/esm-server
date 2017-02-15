'use strict';
// =========================================================================
//
// comment period routes
//
// =========================================================================
angular.module('comment').config(['$stateProvider', 'moment', function ($stateProvider, moment) {
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
					window.location = "http://www.eao.gov.bc.ca/pcp/forms/aurora_digby_form.html";
					return null;
				} else if (project.code === 'kemess-underground') {
					window.location = "http://www.eao.gov.bc.ca/pcp/forms/kemess_form.html";
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
		controller: function ($scope, $state, NgTableParams, periods, project, _, CommentPeriodModel, AlertService) {
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

			s.publishCommentPeriod = function(p) {
				console.log("BG publishCommentPeriod in comment period routes", p);
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
				console.log("BG unpublishCommentPeriod in comment period routes", p);
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
		controller: function ($timeout, $scope, $state, project, period, CommentPeriodModel, _) {
			createEditCommonSetup($timeout, $scope, _,  period, project);

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

					$scope.instructionsSubstitution();

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
		controller: function ($timeout, $scope, $state,  period, project, CommentPeriodModel, CommentModel, _) {
			// only public comments for now...
			period.periodType = 'Public';
			period.commenterRoles = ['public'];

			createEditCommonSetup($timeout, $scope, _,  period, project);

			$scope.hasErrors = false;
			$scope.errorMessage = '';

			$scope.save = function () {
				if (_.size($scope.period.commenterRoles) === 0 || _.size($scope.period.vettingRoles) === 0 || _.size($scope.period.classificationRoles) === 0) {
					$scope.hasErrors = true;
					$scope.errorMessage = 'Post, Vet and Classify Comments roles are all required.  See Roles & Permissions tab.';
				} else {
					$scope.instructionsSubstitution();
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

		//ESM-813 - generic instructions text...
		// we will analyze on save and substitute...
		if (_.isEmpty(period.instructions)) {
			period.instructions = "The public comment period regarding the Proponent's %DOCUMENT_TYPES% for the proposed %PROJECT_NAME% Project is open from %DATE_RANGE%.";
		}

		$scope.instructionsSubstitution = function () {
			// check to see if we can make substitutions to the instructions...
			var PERIOD_TYPE = '%PERIOD_TYPE%';
			var PROJECT_NAME = '%PROJECT_NAME%';
			var DOCUMENT_TYPES = '%DOCUMENT_TYPES%';
			var DATE_RANGE = '%DATE_RANGE%';

			if (!_.isEmpty(period.periodType)) {
				PERIOD_TYPE = period.periodType;
			}
			if (!_.isEmpty(project.name)) {
				PROJECT_NAME = project.name;
			}

			var doctypes = _.map(_.filter(period.relatedDocuments, function(d) { return !_.isEmpty(d.documentType); }), function(r) { return r.documentType; });
			doctypes = _.uniq(doctypes);
			if (_.size(doctypes) > 0) {
				DOCUMENT_TYPES = doctypes.join(", ");
				if (_.size(doctypes) > 1) {
					DOCUMENT_TYPES = DOCUMENT_TYPES + ' documents';
				}
			}

			if (period.dateStarted && period.dateCompleted) {
				DATE_RANGE = moment(period.dateStarted).format("MMMM Do YYYY") + ' to ' + moment(period.dateCompleted).format("MMMM Do YYYY");
			}

			period.instructions = period.instructions.replace('%PERIOD_TYPE%', PERIOD_TYPE);
			period.instructions = period.instructions.replace('%PROJECT_NAME%', PROJECT_NAME);
			period.instructions = period.instructions.replace('%DOCUMENT_TYPES%', DOCUMENT_TYPES);
			period.instructions = period.instructions.replace('%DATE_RANGE%', DATE_RANGE);
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

	/*
	 * For both create and edit setup the period and UI elements
	 */
	function setupPeriodOptions($scope, _) {
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
			typeChange($scope, _);
		};
		$scope.periodChange = function () {
			periodChange($scope, _);
		};

		// if new or old instance of period prior to adding range
		if (!period.rangeType || !period.rangeOption) {
			period.rangeType = 'custom';
			period.rangeOption = 'custom';
			//console.log("defaulting on type and range ");
		}

		if(!period.dateStarted) {
			// console.log("Creating start date",period.dateStarted,period);
			period.dateStarted = moment().set({'hour':9, 'minute':0, 'second': 0, 'millisecond': 0}).toDate();
		}
		if(!period.dateCompleted) {
			// console.log("Creating end date",period.dateCompleted,period);
			period.dateCompleted = moment().set({'hour':23, 'minute':59, 'second': 0, 'millisecond': 0}).toDate();
		}

		// UI elements .. set to match model values
		$scope.rType = _.find(rangeTypes, function(t) { return t.value === period.rangeType; });
		// note need to force conversion to number for === to work
		$scope.rOption = _.find(rangeOptions, function(o) { return ((1 * o.value) === (1*period.rangeOption)); });
	}

	/**
	 * UI allows user to set the end date based on start date, or the reverse, or custom start-to-end.
	 * This handler enables UI controls based on the selected type and fires the periodChange handler.
	 */
	function typeChange($scope, _) {
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
		periodChange($scope, _);
	}

	/**
	 * Recompute the start / end dates based on UI changes
	 *
	 */
	function periodChange($scope, _) {
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

		var numberOfDaysToAdd;
		switch (type) {
			case 'start':
				// derive the end date based on start date and number of days
				// Convert to number. Period includes start and end date subtract one
				period.dateCompleted = computeDate(period.dateStarted, period.dateCompleted, ( 1 * (rOption - 1)));
				//console.log("start periodChange ", period);
				break;
			case 'end':
				// derive the end date based on start date and number of days
				// Convert to number. Period includes start and end date subtract one
				numberOfDaysToAdd = -1 * (rOption - 1);
				period.dateStarted = computeDate(period.dateCompleted, period.dateStarted, ( -1 * (rOption - 1)));
				//console.log("end periodChange ", period);
				break;
			case 'custom':
			// no op
		}
	}

}]);











