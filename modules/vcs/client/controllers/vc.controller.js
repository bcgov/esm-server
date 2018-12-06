'use strict';

angular.module('vcs')

// -------------------------------------------------------------------------
//
// controller for scrolling to the top on button click
//
// -------------------------------------------------------------------------

  .controller('scrollTopCtrl',
    ['$rootScope', 'ngTableEventsChannel',
      function ($rootScope, ngTableEventsChannel) {
        ngTableEventsChannel.onPagesChanged($rootScope.scrollTop, $rootScope);
      }])

// -------------------------------------------------------------------------
//
// controller for listing vcs
//
// -------------------------------------------------------------------------

  .controller('controllerVcList',
    ['$scope', '$rootScope', '$stateParams', 'VcModel', 'NgTableParams', 'PILLARS',
      function ($scope, $rootScope, $stateParams, VcModel, NgTableParams, PILLARS) {
        var self = this;

        //
        // map out any supporting data
        //
        self.pillars = PILLARS.map(function (e) {
          return { id: e, title: e };
        });
        self.project = $stateParams.project;

        //
        // set or reset the collection
        //
        var setData = function () {
          VcModel.forProject($stateParams.project).then(function (data) {
            self.collection = data;
            self.tableParams = new NgTableParams({ count: 10 }, { dataset: data });
          });
        };

        //
        // listen for when to reset
        //
        var unbind = $rootScope.$on('refreshVcList', function () {
          setData();
        });
        $scope.$on('$destroy', unbind);

        //
        // finally, set the data
        //
        setData();
      }])

  .controller('controllerAddTopicModal',
    ['NgTableParams', '$uibModalInstance', '$scope', '_', '$stateParams', 'codeFromTitle', 'VcModel', 'TopicModel', 'PILLARS', 'ArtifactModel',
      function (NgTableParams, $uibModalInstance, $scope, _, $stateParams, codeFromTitle, VcModel, TopicModel, PILLARS, ArtifactModel) {

        var self = this;
        self.current = [];
        self.currentObjs = [];
        self.project = $stateParams.project;

        self.pillars = PILLARS.map(function (e) {
          return { id: e, title: e };
        });

        self.showFilter = true;
        self.okDisabled = true;
        self.cancelDisabled = false;

        // Show all VC types, either pathway or valued components
        TopicModel.getSorted('name').then(function (data) {
          self.tableParams = new NgTableParams({}, { dataset: data });
          $scope.$apply();
        });


        this.toggleItem = function (item) {
          var idx = self.current.indexOf(item._id);
          if (idx === -1) {
            self.currentObjs.push(item);
            self.current.push(item._id);
          } else {
            _.remove(self.currentObjs, { _id: item._id });
            _.remove(self.current, function (n) { return n === item._id; });
          }

          self.okDisabled = _.size(self.currentObjs) === 0;
        };


        this.chosen = function (id) {
          var item = _.find(self.currentObjs, function (o) { return o._id === id; });
          return !_.isEmpty(item);
        };

        this.ok = function () {
          self.okDisabled = true;
          self.cancelDisabled = true;

          var savedArray = [];
          _.each(self.currentObjs, function (obj, idx) {
            VcModel.getNew().then(function (m) {
              m.project = $scope.project;
              m.name = obj.name;
              m.title = obj.name;
              m.pillar = obj.pillar;
              m.type = obj.type;
              VcModel.query({ project: $scope.project })
                .then(function (/* data */) {
                  VcModel.saveCopy(m)
                    .then(function (saved) {
                      return ArtifactModel.getNew()
                        .then(function (f) {
                          f.valuedComponents.push(m);
                          f.name = obj.name;
                          f.typeCode = 'valued-component';
                          f.project = $scope.project._id;
                          return ArtifactModel.saveCopy(f);
                        })
                        .then(function (art) {
                          // Save the reference that this VC relates to.  We will look to
                          // re-use this to build up the package of VC's later.
                          saved.artifact = art;
                          return VcModel.save(saved);
                        });
                    })
                    .then(function (obj) {
                      savedArray.push(obj);
                      if (idx === self.currentObjs.length - 1) {
                        // Return the collection back to the caller
                        $uibModalInstance.close(savedArray);
                        // since we are closing, this doesn't matter...
                        self.okDisabled = _.size(self.currentObjs) === 0;
                        self.cancelDisabled = false;
                      }
                    });
                },
                function (/* error */) {
                  // an error occurred...
                  self.okDisabled = _.size(self.currentObjs) === 0;
                  self.cancelDisabled = false;
                });
            });
          });
        };

        this.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };
      }])

  // -------------------------------------------------------------------------
  //
  // controller for editing or adding vcs
  //
  // -------------------------------------------------------------------------
  .controller('controllerEditVcModal',
    ['$uibModalInstance', '$scope', '_', 'codeFromTitle', 'VcModel', 'TopicModel', 'PILLARS',
      function ($uibModalInstance, $scope, _, codeFromTitle, VcModel, TopicModel, PILLARS) {
        var self = this;

        //
        // pull the mode and other info from the scope inputs
        //
        this.mode = $scope.mode;

        //
        // set up any data from services that needs massaging
        //
        this.pillars = PILLARS;

        // -------------------------------------------------------------------------
        //
        // set up handlers and functions on scope
        //
        // -------------------------------------------------------------------------
        this.selectTopic = function () {
          var self = this;
          TopicModel.getTopicsForPillar(this.vc.pillar).then(function (topics) {
            self.topics = topics;
            $scope.$apply();
          });
        };
        this.ok = function () {
          if (this.mode === 'add') {
            VcModel.saveModel().then(function (result) {
              $uibModalInstance.close(result);
            });
          }
          else if (this.mode === 'edit') {
            VcModel.saveModel().then(function (result) {
              $scope.vc = _.cloneDeep(result);
              $uibModalInstance.close(result);
            });
          }
          else {
            $uibModalInstance.dismiss('cancel');
          }
        };
        this.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };

        //
        // finally, deal with the mode and setting data up for each one
        // and kick off the directive
        //
        if (this.mode === 'add') {
          this.dmode = 'Add';
          VcModel.getNew().then(function (model) {
            self.vc = model;
            self.selectTopic();
          });
        } else if (this.mode === 'edit') {
          this.dmode = 'Edit';
          this.vc = VcModel.getCopy($scope.vc);
          VcModel.setModel(this.vc);
          this.selectTopic();
        } else {
          this.dmode = 'View';
          this.vc = $scope.vc;
          this.selectTopic();
        }
      }]);


