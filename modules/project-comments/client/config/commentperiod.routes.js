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
              return openPeriod;
            } else {
              return null;
            }
          });
      }
    },
    controller: function ($scope, $state, NgTableParams, periods, activeperiod, project, CommentPeriodModel, AlertService) {
      var s = this;
      $scope.activeperiod = null;
      if (activeperiod) {
        // Switch on the UI for comment period
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
              AlertService.success('Comment Period was deleted!', 4000);
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
              AlertService.success('Comment Period was published!', 4000);
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
              AlertService.success('Comment Period was unpublished!', 4000);
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
    url: '/:periodType/create',
    templateUrl: 'modules/project-comments/client/views/period-edit.html',
    resolve: {
      periodType: function($stateParams) {
        if ($stateParams.periodType === 'joint') {
          return 'Joint';
        }
        return 'Public';  // default
      },
      period: function (periodType, CommentPeriodModel) {
        return CommentPeriodModel.getNew().then(function(model) {
          model.periodType = periodType;
          return model;
        });
      },
      mode: function() {
        return 'create';
      }
    },
    onEnter: function($state, project){
      // can't use data.permissions, as project is not loaded
      // so check this now before we get into the controller...
      if (!project.userCan.createCommentPeriod) {
        $state.go('forbidden');
      }
    },
    controller: function ($timeout, $scope, $state, mode, project, period, periodType, CommentPeriodModel, CodeLists) {
      // TODO: This whole method (and the ones below) should be refactored.
      if (periodType === 'Joint') {
        // For now, putting Joint PCP logic here and we'll come back and refactor later...
        new JointCommentPeriod().create($timeout, $scope, $state, mode, project, period, periodType, CommentPeriodModel, CodeLists);
      } else if (periodType === 'Public') {
        // Logic for regular PCP follows...
        createPublicCommentPeriod($timeout, $scope, $state, mode, project, period, periodType, CommentPeriodModel, CodeLists);
      }
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
        return CommentPeriodModel.getForPublic ($stateParams.periodId);
      },
      mode: function() {
        return 'edit';
      }
    },
    onEnter: function($state, project){
      // can't use data.permissions, as project is not loaded
      // so check this now before we get into the controller...
      if (!project.userCan.createCommentPeriod) {
        $state.go('forbidden');
      }
    },
    controller: function ($timeout, $scope, $state, mode, period, project, CommentPeriodModel, CommentModel, CodeLists) {
      // TODO: This whole method (and the ones below) should be refactored.
      if (period.periodType === 'Joint') {
        // For now, putting Joint PCP logic here and we'll come back and refactor later...
        new JointCommentPeriod().edit($timeout, $scope, $state, mode, period, project, CommentPeriodModel, CommentModel, CodeLists);
      } else if (period.periodType === 'Public') {
        editPublicCommentPeriod($timeout, $scope, $state, mode, period, project, CommentPeriodModel, CommentModel, CodeLists);
      }
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
      },
      userRoles: function(project, UserModel) {
        return UserModel.rolesInProject(project._id);
      }
    },
    controller: function ($scope, period, project, userRoles) {
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
      $scope.isJoint = $scope.period.periodType === 'Joint';
      $scope.isPublic = $scope.period.periodType === 'Public';
      $scope.userRoles = userRoles;

      // convert instructions to displayable HTML
      $scope.aboutThisPeriod = period.instructions.replace(/\n/g,"<br>");
      // anyone with vetting comments can add a comment at any time
      // all others with add comment permission must wait until the period is open
      $scope.allowCommentSubmit = (isopen && period.userCan.addComment) || period.userCan.vetComments;

    }
  })

  ;

  // -------------------------------------------------------------------------
  //
  // these are specific to public comments (regular PCP)
  //
  //
  // -------------------------------------------------------------------------
  function createPublicCommentPeriod($timeout, $scope, $state, mode, project, period, periodType, CommentPeriodModel, CodeLists) {
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
        });
      }
    };

    defineDocumentMgr($scope);

    $scope.documentMgr.applySort();

    $scope.changeType ();
  }

  function editPublicCommentPeriod($timeout, $scope, $state, mode, period, project, CommentPeriodModel, CommentModel, CodeLists) {
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
        });
      }
    };

    defineDocumentMgr($scope);

    $scope.documentMgr.applySort();

    $scope.changeType ();
  }

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

    $scope.addLinkedFiles = function(data) { addLinkedFiles($scope, data);  };

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
    }

    // UI elements .. set to match model values
    $scope.ui = {};
    $scope.ui.rType = _.find(rangeTypes, function(t) { return t.value === period.rangeType; });
    // note need to force conversion to number for === to work
    $scope.ui.rOption = _.find(rangeOptions, function(o) { return ( o.value === (''+period.rangeOption)); });
  }

  /**
   * UI allows user to set the end date based on start date, or the reverse, or custom start-to-end.
   * This handler enables UI controls based on the selected type and fires the periodChange handler.
   */
  function typeChange($scope) {
    // get value from UI
    var type = $scope.ui.rType.value;
    var period = $scope.period;
    // store UI set value into model
    var isChanged = period.rangeType !== $scope.ui.rType.value;
    period.rangeType = type;

    var defaultOption = $scope.rangeOptions[0]; // 30 days
    var customOption = $scope.rangeOptions[4];

    $scope.endPickerEnabled = true;
    $scope.startPickerEnabled = true;
    $scope.rangePickerEnabled = true;
    switch (type) {
      case 'start':
        $scope.endPickerEnabled = false;
        if(isChanged) $scope.ui.rOption = defaultOption;
        break;
      case 'end':
        $scope.startPickerEnabled = false;
        if(isChanged) $scope.ui.rOption = defaultOption;
        break;
      case 'custom':
        $scope.rangePickerEnabled = false;
        if(isChanged) $scope.ui.rOption = customOption;
    }
    periodChange($scope);
  }

  /**
   * Recompute the start / end dates based on UI changes
   *
   */
  function periodChange($scope) {
    // get value from UI
    var rOption = $scope.ui.rOption.value;
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

    // Convert to number when type is not "custom". Period uses day zero rules excludes start and includes end date
    var numberOfDaysToAdd;
    switch (type) {
      case 'start':
        numberOfDaysToAdd = (rOption);
        period.dateCompleted = computeDate(period.dateStarted, period.dateCompleted, numberOfDaysToAdd);
        break;
      case 'end':
        numberOfDaysToAdd = -1 * (rOption);
        period.dateStarted = computeDate(period.dateCompleted, period.dateStarted, numberOfDaysToAdd);
        break;
      case 'custom':
      // no op
    }
  }

  // -------------------------------------------------------------------------
  //
  // these are specific to joint comments (Joint PCP)
  //
  //
  // -------------------------------------------------------------------------
  function JointCommentPeriod() {
    //
    // Public methods
    //
    this.create = function($timeout, $scope, $state, mode, project, period, periodType, CommentPeriodModel, CodeLists) {
      $scope.mode = mode;
      $scope.hasErrors = false;

      // Placeholder text for Package 1 (i.e. Provincial) of Joint PCPs
      period.informationLabel = 'Draft Assessment Report & Draft Conditions';
      period.ceaaInformationLabel = ' ';
      period.commenterRoles = ['public'];

      commonSetup($timeout, $scope, period, project, CodeLists, CommentPeriodModel);

      $scope.save = function () {
        if (_.size($scope.period.commenterRoles) === 0 || _.size($scope.period.vettingRoles) === 0 || _.size($scope.period.downloadRoles) === 0) {
          $scope.hasErrors = true;
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
          });
        }
      };
    };

    this.edit = function($timeout, $scope, $state, mode, period, project, CommentPeriodModel, CommentModel, CodeLists) {
      $scope.mode = mode;
      $scope.busy = false;
      $scope.hasErrors = false;
      $scope.errorMessage = '';

      period.commenterRoles = ['public'];

      // store these, if they change, we need to update all child comment permissions...
      var originalPeriodRoles = {
        read: period.read,
        write: period.write,
        delete: period.delete,
        commenterRoles: period.commenterRoles,
        vettingRoles: period.vettingRoles,
        downloadRoles: period.downloadRoles
      };

      var rolesChanged = function(period) {
        var periodRoles = {
          read: period.read,
          write: period.write,
          delete: period.delete,
          commenterRoles: period.commenterRoles,
          vettingRoles: period.vettingRoles,
          downloadRoles: period.downloadRoles
        };
        return (JSON.stringify(originalPeriodRoles) !== JSON.stringify(periodRoles));
      };

      commonSetup($timeout, $scope, period, project, CodeLists);

      // ESM-761: for edit - don't show project-system-admin roles for vet and download...
      // "project-system-admin" is added automatically on the back-end for canVet and canDownload but we don't want to show it in the UI
      period.vettingRoles = _.without(period.vettingRoles, 'project-system-admin');
      period.downloadRoles = _.without(period.downloadRoles, 'project-system-admin');

      $scope.mode = mode;
      $scope.busy = false;
      $scope.hasErrors = false;
      $scope.errorMessage = '';

      $scope.save = function () {
        if (_.size($scope.period.commenterRoles) === 0 || _.size($scope.period.vettingRoles) === 0 || _.size($scope.period.downloadRoles) === 0) {
          $scope.hasErrors = true;
        } else {
          $scope.busy = true;

          CommentPeriodModel.save($scope.period)
          .then(function (model) {
            if (!rolesChanged(model)) {
              return;
            } else {
              // save the comments so that we pick up the (potential) changes to the period permissions...
              return CommentModel.commentPeriodCommentsSync(project._id, model._id, period.stats.total);
            }
          })
          .then(function () {
            $scope.busy = false;
            $state.transitionTo('p.commentperiod.list', {projectid: project.code}, {
              reload: true, inherit: false, notify: true
            });
          })
          .catch(function (err) {
            $scope.busy = false;
            console.error(err);
          });
        }
      };
    };

    //
    // Private methods
    //
    function commonSetup($timeout, $scope, period, project, CodeLists, CommentPeriodModel) {
      $scope.period = period;
      $scope.project = project;

      var allDocs = $scope.period.relatedDocuments.concat($scope.period.ceaaRelatedDocuments);
      _.each(allDocs, function(d) {
        if (_.isEmpty(d.displayName)) {
          d.displayName = d.documentFileName || d.internalOriginalName;
        }
      });

      // Create functions bound to the specific collection we will be adding files to...
      // These conform to the signature of the callback expected by the "Link Files" modal dialog
      $scope.addToProvincialPackage = function (data) { addFilesToPackage('EAO', period, data); };
      $scope.addToFederalPackage = function (data) { addFilesToPackage('CEAA', period, data); };

      // manage the start and end dates plus the controls that set period length based on presets (e.g. 30, 45, etc days)
      setupUIState($scope);

      // initialize the period controls
      onTypeChange($scope);

      // on change to start date or end date via date picker...
      $scope.$on('modalDatePicker.onChange', function () { onPeriodChange($scope); });

      $scope.$watchGroup(['period.dateStarted', 'period.dateCompleted','period.additionalText','period.informationLabel', 'period.ceaaAdditionalText', 'period.ceaaInformationLabel'], function() {
        instructions(project, period, CommentPeriodModel);
      });
    }

    // Joint PCP - generic function to add/link a collection of documents to a package of information
    function addFilesToPackage(packageName, period, files) {
      switch (packageName) {
        case 'EAO':
          addFilesToCollection(period.relatedDocuments, files);
          break;

        case 'CEAA':
          addFilesToCollection(period.ceaaRelatedDocuments, files);
          break;

        default:
          break;
      }
    }

    function addFilesToCollection(targetCollection, data) {
      // add files in data to our relatedDocs
      if (data) {
        _.each(data, function(d) {
          var f = _.find(targetCollection, function(r) { return r._id.toString() === d._id.toString(); });
          if (!f) {
            //ok, add this to the list.
            if (_.isEmpty(d.displayName)) {
              d.displayName = d.documentFileName || d.internalOriginalName;
            }
            targetCollection.push(d);
          }
        });
      }
    }

    /*
    * For both create and edit setup the period and UI elements
    */
    function setupUIState($scope) {
      // from the model
      // rangeType        : { type:String, default:null, enum:['start', 'end', 'custom']},
      // rangeOption      : { type:String, default:null, enum:['30', '45', '60', '75', 'custom']},
      var period = $scope.period;
      var rangeTypes = [
        {displayName: "Custom Date Range", value: "custom"},
        {displayName: "Start Date", value: "start"},
        {displayName: "End Date", value: "end"}
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
        onTypeChange($scope);
        onPeriodChange($scope);
      };
      $scope.periodChange = function () {
        onPeriodChange($scope);
      };

      // if new or old instance of period prior to adding range
      if (!period.rangeType || !period.rangeOption) {
        period.rangeType = 'custom';
        period.rangeOption = 'custom';
      }

      // UI elements .. set to match model values
      $scope.ui = {};
      $scope.ui.rType = _.find(rangeTypes, function(t) { return t.value === period.rangeType; });
      // note need to force conversion to number for === to work
      $scope.ui.rOption = _.find(rangeOptions, function(o) { return ( o.value === (''+period.rangeOption)); });
    }

    /**
     * UI allows user to set the end date based on start date, or the reverse, or custom start-to-end.
     * This handler enables UI controls based on the selected type and fires the periodChange handler.
     */
    function onTypeChange($scope) {
      // get value from UI
      var type = $scope.ui.rType.value;
      var period = $scope.period;
      // store UI set value into model
      var isChanged = period.rangeType !== $scope.ui.rType.value;
      period.rangeType = type;

      var defaultOption = $scope.rangeOptions[0]; // 30 days
      var customOption = $scope.rangeOptions[4];

      $scope.endPickerEnabled = true;
      $scope.startPickerEnabled = true;
      $scope.rangePickerEnabled = true;
      switch (type) {
        case 'start':
          $scope.endPickerEnabled = false;
          if(isChanged) $scope.ui.rOption = defaultOption;
          break;
        case 'end':
          $scope.startPickerEnabled = false;
          if(isChanged) $scope.ui.rOption = defaultOption;
          break;
        case 'custom':
          $scope.rangePickerEnabled = false;
          if(isChanged) $scope.ui.rOption = customOption;
      }
    }

    /**
     * Recompute the start / end dates based on UI changes
     */
    function onPeriodChange($scope) {
      // get value from UI
      var rOption = $scope.ui.rOption.value;
      // store UI set value into model
      var period = $scope.period;
      period.rangeOption = rOption;

      var type = period.rangeType;

      // Convert to number when type is not "custom". Period uses day zero rules excludes start and includes end date
      var numberOfDaysToAdd;
      switch (type) {
        case 'start':
          numberOfDaysToAdd = (rOption);
          period.dateCompleted = computeDate(period.dateStarted, period.dateCompleted, numberOfDaysToAdd);
          break;
        case 'end':
          numberOfDaysToAdd = -1 * (rOption);
          period.dateStarted = computeDate(period.dateCompleted, period.dateStarted, numberOfDaysToAdd);
          break;
        case 'custom':
        // no op
      }
    }

    // add X number of days based on (firstDate) but preserve the time in the original (secondDate)
    function computeDate(firstDate, secondDate, numberOfDaysToAdd) {
      var savedTime;
      if (!firstDate) {
        return undefined;
      }
      if (secondDate) {
        var mb = moment(secondDate);
        savedTime = { hour: mb.hour(), minute: mb.minute(), second: mb.second() };
      }
      var ms = moment(firstDate);
      ms.add(numberOfDaysToAdd, 'days');
      if (savedTime) {
        ms.hour(savedTime.hour).minute(savedTime.minute).second(savedTime.second);
      }
      return ms.toDate();
    }

    function instructions(project, period, CommentPeriodModel) {
      var template = "This Public Comment Period is regarding the %INFORMATION_LABEL_PACKAGE_1% and the %INFORMATION_LABEL_PACKAGE_2%.";

      var PROJECT_NAME = project.name || '%PROJECT_NAME%';
      var INFORMATION_LABEL_PACKAGE_1 = period.informationLabel || '%INFORMATION_LABEL_PACKAGE_1%';
      var INFORMATION_LABEL_PACKAGE_2 = period.ceaaInformationLabel || '%INFORMATION_LABEL_PACKAGE_2%';

      period.instructions = template.replace('%PROJECT_NAME%', PROJECT_NAME)
        .replace('%INFORMATION_LABEL_PACKAGE_1%', INFORMATION_LABEL_PACKAGE_1)
        .replace('%INFORMATION_LABEL_PACKAGE_2%', INFORMATION_LABEL_PACKAGE_2);
    }
  } // - End of JointCommentPeriod() -
}]);
