'use strict';

angular.module ('vcs')

// -------------------------------------------------------------------------
//
// directive for listing vcs
//
// -------------------------------------------------------------------------
  .directive ('tmplVcList', function () {
    return {
      restrict: 'E',
      templateUrl: 'modules/vcs/client/views/vc-list.html',
      controller: 'controllerVcList',
      controllerAs: 'data'
    };
  })
// -------------------------------------------------------------------------
//
// directive for adding or editing a vc
//
// -------------------------------------------------------------------------
  .directive ('editVcModal', ['$uibModal','$rootScope', function ($uibModal, $rootScope) {
    return {
      restrict: 'A',
      scope: {
        collection: '=',
        vc: '=',
        mode: '='
      },
      link : function (scope, element) {
        element.on ('click', function () {
          var modalView = $uibModal.open ({
            animation    : true,
            templateUrl  : 'modules/vcs/client/views/vc-edit.html',
            controller   : 'controllerEditVcModal',
            controllerAs : 'd',
            scope        : scope,
            size         : 'lg'
          });
          modalView.result.then (function (/* model */) {
            $rootScope.$broadcast('refreshVcList');
          }, function () {});
        });
      }
    };
  }])

// -------------------------------------------------------------------------
//
// a modal directive with isolated scope for viewing and
// interacting with a list of artifacts in order to choose one.
// so, essentially an artifact chooser
//
// -------------------------------------------------------------------------
  .directive ('vcLinker', function ($uibModal, VcModel, _) {
    return {
      restrict: 'A',
      scope: {
        project: '=',
        vc: '=',
        vcs: '=',
        vclist: '='
      },
      link : function(scope, element) {
        element.on('click', function () {
          $uibModal.open ({
            animation: true,
            templateUrl: 'modules/vcs/client/views/vc-picker.html',
            controllerAs: 's',
            size: 'md',
            windowClass: 'vc-chooser-view',
            controller: function ($scope, $uibModalInstance) {
              var s = this;
              s.selected = angular.copy(scope.vclist);
              s.vcs = angular.copy(scope.vcs); // The list of all current vcs on the project
              s.cancel = function () { $uibModalInstance.dismiss ('cancel'); };
              s.findById = function (id) {
                for (var i = 0; i < s.selected.length; i++) {
                  if (s.selected[i]._id === id) {
                    return i;
                  }
                }
                return -1;
              };
              s.ok = function () {
                // finish up and test.. maybe remove/create new directive
                s.selected = _.sortByOrder(s.selected, "name", "asc");
                scope.vc.subComponents = s.selected;
                $uibModalInstance.close (s.selected);
              };
              s.dealwith = function (vc) {
                var i = s.findById (vc._id);
                if (i !== -1) {
                  s.selected.splice (i, 1);
                }
                else {
                  s.selected.push (vc);
                }
              };
            }
          })
            .result.then (function (data) {
              scope.vclist = data;
            })
            .catch (function (/* err */) {
              // swallow error
            });
        });
      }
    };
  })

  .directive ('vcChooser', function ($uibModal, VcModel, _) {
    return {
      restrict: 'A',
      scope: {
        project: '=',
        current: '=',
        pillars: '=',
        topics: '='
      },
      link : function(scope, element) {
        element.on('click', function () {
          $uibModal.open ({
            animation: true,
            templateUrl: 'modules/vcs/client/views/vc-chooser.html',
            controllerAs: 's',
            size: 'md',
            windowClass: 'vc-chooser-view',
            resolve: {
              vcs: function (VcModel) {
                return VcModel.forProject (scope.project._id)
                  .then( function (list) {
                    var rval = []; // ESM-733 display only published VCs
                    _.each(list, function (item) {
                      if(item.isPublished) {
                        rval.push(item);
                      }
                    });
                    return rval;
                  });
              }
            },
            controller: function ($scope, $uibModalInstance, vcs) {
              var s = this;
              s.selected = scope.current;
              s.vcs = vcs;
              var index = vcs.reduce (function (prev, next) {
                prev[next._id] = next;
                return prev;
              }, {});
              s.cancel = function () { $uibModalInstance.dismiss ('cancel'); };
              s.ok = function () {
                var pills = {};
                var tops = [];
                scope.pillars.splice (0);
                scope.topics.splice (0);
                tops = s.selected.map (function (e) {
                  pills[index[e].pillar] = 1;
                  // jsherman - 20160804: chooser displays the title, so let's return title to the caller, not name.
                  return index[e].title;
                });
                scope.pillars = _.keys (pills);
                scope.topics = tops;
                $uibModalInstance.close (s.selected);
              };
              s.dealwith = function (id) {
                var i = s.selected.indexOf (id);
                if (i !== -1) {
                  s.selected.splice (i, 1);
                }
                else {
                  s.selected.push (id);
                }
              };
            }
          })
            .result.then (function (/* data */) {
            // fullfill promise by doing nothing?
            })
            .catch (function (/* err */) {
            // swallow error
            });
        });
      }
    };
  });
