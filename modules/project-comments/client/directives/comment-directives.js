'use strict';

var PLEASE_SEE = "Please see attached";
var NO_COMMENT = "No comment";
var MUST_VET_ATTACHMENTS = "Must publish or reject all attachments before proceeding.";
var MUST_HAVE_PUBLISHABLE = "To publish need a comment or published attachment";

// =========================================================================
//
// Directives to do with comments either public or working group
//
// =========================================================================
angular.module('comment')
  // -------------------------------------------------------------------------
  //
  // list of public comments from the point of view of the public
  //
  // -------------------------------------------------------------------------
  .directive('tmplPublicCommentList', function ($uibModal) {
    return {
      scope: {
        period: '=',
        project: '=',
        userRoles: '='
      },
      restrict: 'E',
      templateUrl: 'modules/project-comments/client/views/public-comments/list.html',
      controllerAs: 's',
      controller: function ($scope, $rootScope, $filter, NgTableParams, Authentication, CommentModel, UserModel, CommentPeriodModel, VcModel, TopicModel, _) {
        var s = this;
        var project = s.project = $scope.project;
        var period = s.period = $scope.period;
        var userRoles = s.userRoles = $scope.userRoles || [];

        s.topicsArray = [];
        s.suggestedTopics = [];
        s.pillarsArray = [];
        s.showTopicCloud = false;

        s.isPublic = period.periodType === 'Public';

        s.hasRole = function (role) {
          return _.includes(userRoles, role);
        };

        s.filterCommentOptions = [{
          name: 'All',
          displayName: 'Show All Comments'
        },
        {
          name: 'Provincial',
          displayName: 'Comments on ' + period.informationLabel
        },
        {
          name: 'Federal',
          displayName: 'Comments on ' + period.ceaaInformationLabel
        }
        ];

        s.selectedCommentFilterOption = s.filterCommentOptions[0];
        s.filterCommentPackage = s.selectedCommentFilterOption.name;

        s.changeFilterCommentPackage = function () {
          s.isLoading = true;
          s.filterCommentPackage = s.selectedCommentFilterOption.name;
          $scope.smartTableCtrl.pipe($scope.smartTableCtrl.tableState());
        };

        // Prototype Filtering
        //var orderBy = $filter('orderBy');

        $scope.propertyName = 'count';
        $scope.reverse = true;
        $scope.topics = s.period.topics;

        $scope.sortBy = function(propertyName) {
          $scope.reverse = (propertyName !== null && $scope.propertyName === propertyName) ? !$scope.reverse : false;
          $scope.propertyName = propertyName;
        };

        var refreshFilterArrays = function (p) {
          s.period = p;

          s.total = p.stats.total;
          s.totalPublished = p.stats.totalPublished;
          s.totalPending = p.stats.totalPending;
          s.totalDeferred = p.stats.totalDeferred;
          s.totalPublic = p.stats.totalPublic;
          s.totalRejected = p.stats.totalRejected;
          s.totalAssigned = p.stats.totalAssigned;
          s.totalUnassigned = p.stats.totalUnassigned;

          var sortedTopics = _.sortBy(s.period.topics, '_id');
          var sortedPillars = _.sortBy(s.period.pillars, '_id');

          var allTopics = _.pluck(sortedTopics, '_id');
          var allPillars = _.pluck(sortedPillars, '_id');

          var topicList = _.transform(allTopics, function (result, t) {
            result.push({
              id: t,
              name: t
            });
          }, []);

          var pillarList = _.transform(allPillars, function (result, p) {
            result.push({
              id: p,
              name: p
            });
          }, []);

          // jsherman - 20160804: need an empty one for chrome, so we can de-select the filter...
          // adds a bogus one to safari and IE though:( so put at the bottom.
          topicList.push({
            id: '',
            name: ''
          });
          angular.copy(topicList, s.topicsArray);
          // as above...
          pillarList.push({
            id: '',
            name: ''
          });
          angular.copy(pillarList, s.pillarsArray);

          var topicCloud = _.transform(sortedTopics, function (result, t) {
            result.push({
              name: t._id,
              size: t.count
            });
          }, []);

          s.refreshVisualization = 1;
          // This is an example of what the tag cloud expects
          // s.commentsByTopicVis = { name: 'byTopic', children:[
          // 	{name: "Thing 1", size: 1},
          // 	{name: "Thing 2", size: 2},
          // 	{name: "Cat in the Hat", size: 3},
          // ]};
          s.commentsByTopicVis = {
            name: 'byTopic',
            children: topicCloud
          };
        };

        $scope.authentication = Authentication;

        // -------------------------------------------------------------------------
        //
        // these toggle things (the tab groups and filters)
        //
        // -------------------------------------------------------------------------
        $scope.smartTableCtrl = {};

        s.eaoStatus = null;
        s.proponentStatus = null;
        if (s.period.userCan.vetComments) {
          s.eaoStatus = 'Unvetted';
        }
        if (s.period.userCan.classifyComments && !s.period.userCan.vetComments) {
          s.proponentStatus = 'Unclassified';
        }

        //s.period.userCan.classifyComments && !s.period.userCan.vetComments
        s.toggle = function (v) {
          s.eaoStatus = v;
          $scope.smartTableCtrl.pipe($scope.smartTableCtrl.tableState());
        };
        s.toggleP = function (v) {
          s.proponentStatus = v;
          $scope.smartTableCtrl.pipe($scope.smartTableCtrl.tableState());
        };

        s.displayed = [];
        s.isLoading = false;
        // columns: all pcp; author, location, date.  eao-pcp adds; pillar, vc.  authentication.user add one for id
        // public: 3, eao pcp: 5,  +1 for auth user.
        s.colspan = 3 + (s.isPublic ? 3 : 0) + ($scope.authentication.user ? 1 : 0);
        s.pageSize = 50;

        // mostly this is so the value in the drop down lists displays what is in the tableState.search.predicateObject
        var filterByFields = {
          commentId: undefined,
          authorComment: undefined,
          location: undefined,
          pillar: undefined,
          topic: undefined,
          hasProponentResponse: undefined
        };

        s.changePageSize = function (value) {
          s.pageSize = value;
          $scope.smartTableCtrl.pipe($scope.smartTableCtrl.tableState());
        };

        s.currentFilterBy = {}; // store the base query/filter, when it changes, go back to first page.

        s.callServer = function (tableState, ctrl) {
          if ($scope.smartTableCtrl !== ctrl) {
            $scope.smartTableCtrl = ctrl;
          }

          s.isLoading = true;

          var pagination = tableState.pagination;
          var sort = tableState.sort;
          if (tableState) {
            $rootScope.scrollTop();
          }

          var start = pagination.start || 0; // This is NOT the page number, but the index of item in the list that you want to use to display the table.
          var limit = pagination.number || s.pageSize; // Number of entries showed per page.

          // set the primary query - PUBLIC users
          var filterBy = {
            period: s.period._id,
            eaoStatus: undefined,
            proponentStatus: undefined,
            isPublished: true
          };

          // EAO role - user with vetting permissions
          if (s.period.userCan.vetComments) {
            filterBy = {
              period: s.period._id,
              eaoStatus: s.eaoStatus,
              proponentStatus: undefined,
              isPublished: undefined
            };
          }

          // PROPONENT role
          if (s.period.userCan.classifyComments && !s.period.userCan.vetComments) {
            if (s.proponentStatus === 'Classified') {
              filterBy = {
                period: s.period._id,
                eaoStatus: undefined,
                proponentStatus: 'Classified',
                isPublished: true
              };
            } else {
              filterBy = {
                period: s.period._id,
                eaoStatus: undefined,
                proponentStatus: 'Unclassified',
                isPublished: true
              };
            }
          }

          if (JSON.stringify(s.currentFilterBy) !== JSON.stringify(filterBy)) {
            s.currentFilterBy = angular.copy(filterBy);
            start = 0;
          }

          if (tableState.search.predicateObject) {
            filterByFields.commentId = tableState.search.predicateObject.commentId;
            filterByFields.authorComment = tableState.search.predicateObject.authorComment;
            filterByFields.location = tableState.search.predicateObject.location;
            filterByFields.pillar = tableState.search.predicateObject.pillar;
            filterByFields.topic = tableState.search.predicateObject.topic;
            filterByFields.hasProponentResponse = tableState.search.predicateObject.hasProponentResponse;
          }

          CommentPeriodModel.getForPublic(s.period._id)
            .then(function (p) {
              refreshFilterArrays(p);
              /*
                Nick: This is the call that eventually calls the backend to fetch the comments for the period.
               */
              return CommentModel.getCommentsForPeriod(
                filterBy.period, filterBy.eaoStatus, filterBy.proponentStatus, filterBy.isPublished,
                filterByFields.commentId, filterByFields.authorComment, filterByFields.location, filterByFields.pillar, filterByFields.topic, filterByFields.hasProponentResponse,
                start, limit, sort.predicate, sort.reverse, s.filterCommentPackage);
            })
            .then(function (result) {
              _.each(result.data, function (item) {
                var publishedCount = function (item) {
                  var count = _.reduce(item.documents, function (total, doc) {
                    return doc.eaoStatus === 'Published' ? total + 1 : total;
                  }, 0);

                  return count;
                };
                var docCount = item.documents.length;
                item.publishedDocumentCount = period.userCan.vetComments ? docCount : publishedCount(item);
                item.authorAndComment = item.isAnonymous ? item.comment : item.author + ' ' + item.comment;
              });

              /*
                NICK: result.data contains the 50 comment results from the comments table.
                50 because that is the pagination limit.
                This is called on the Public Comment Period admin list.
              */
              s.displayed = result.data;
              tableState.pagination.start = start;
              tableState.pagination.totalItemCount = result.count;
              tableState.pagination.numberOfPages = Math.ceil(result.count / limit); //set the number of pages so the pagination can update
              s.isLoading = false;
              $scope.$apply();
            });
        };

        s.downloadCommentData = function () {
          var getBrowser = function () {
            var userAgent = window.navigator.userAgent;

            // Feature detection method
            if (Object.hasOwnProperty.call(window, "ActiveXObject") && !window.ActiveXObject) {
              return 'ie';
            }
            if (navigator.appVersion.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident") !== -1 || navigator.appVersion.indexOf("Edge") !== -1) {
              return 'ie';
            }

            var browsers = {
              chrome: /chrome/i,
              safari: /safari/i,
              firefox: /firefox/i,
              ie: /internet explorer/i
            };
            for (var key in browsers) {
              if (browsers[key].test(userAgent)) {
                return key;
              }
            }
          };

          var onlyPublishedComments = true;
          var canSeeRejectedDocs = false;

          // Only EAO staff (or whoever has permissions to vet comments) should be able to see unpublished comments
          if (s.period.userCan.vetComments) {
            onlyPublishedComments = undefined;
            canSeeRejectedDocs = true;
          }

          // Return a promise with the CSV data to download
          CommentPeriodModel.getForPublic(s.period._id)
            .then(function (p) {
              refreshFilterArrays(p);
              return CommentModel.getCommentsForPeriod(
                s.period._id, undefined, undefined, onlyPublishedComments,
                undefined, undefined, undefined, undefined, undefined, undefined,
                0, s.total, 'commentId', true, undefined);
            })
            .then(function (result) {
              CommentModel.prepareCSV(result.data, canSeeRejectedDocs)
                .then(function (data) {
                  var blob = new Blob([data], {
                    type: 'octet/stream'
                  });
                  var filename = 'EAO_PCP_Comments.csv';
                  var browse = getBrowser();
                  if (browse === 'firefox') {
                    var ff = angular.element('<a/>');
                    ff.css({
                      display: 'none'
                    });
                    angular.element(document.body).append(ff);
                    ff.attr({
                      href: 'data:attachment/csv;charset=utf-8,' + encodeURI(data),
                      target: '_blank',
                      download: filename
                    })[0].click();
                    ff.remove();
                  } else if (browse === 'ie') {
                    window.navigator.msSaveBlob(blob, filename);
                  } else if (browse === 'safari') {
                    var safariBlob = new Blob([data], {
                      type: 'text/csv;base64'
                    });
                    var safariUrl = window.webkitURL.createObjectURL(safariBlob);
                    var safariAnchor = document.createElement("a");
                    safariAnchor.href = safariUrl;
                    safariAnchor.click();
                    window.webkitURL.revokeObjectURL(safariUrl);
                  } else {
                    var url = (window.URL || window.webkitURL).createObjectURL(blob);
                    var anchor = document.createElement("a");
                    anchor.download = filename;
                    anchor.href = url;
                    anchor.click();
                    window.URL.revokeObjectURL(url);
                  }
                });
            });
        };

        // -------------------------------------------------------------------------
        //
        // if the user clicks a row, open the detail modal
        //
        // -------------------------------------------------------------------------
        /*
          Nick: when a user clicks on a comment row from the comment period list
        */
        s.detail = function (comment, filterCommentPackage) {
          /*
            Nick: This is an individual comment object from the array of 50 returned earlier.
          */
          $uibModal.open({
            animation: true,
            templateUrl: 'modules/project-comments/client/views/public-comments/detail.html',
            controllerAs: 's',
            size: 'lg',
            windowClass: 'public-comment-modal',
            resolve: {
              docs: function () {
                // Documents related to the Provincial package within a joint PCP
                return CommentModel.getDocuments(comment._id);
              },
              projectValuedComponents: function () {
                return VcModel.forProject($scope.project._id)
              },
              allSystemTopics: function() {
                return TopicModel.getAllTopics();
              }
            },
            controller: function ($scope, $uibModalInstance, docs, projectValuedComponents, allSystemTopics) {
              var self = this;
              self.period = period;
              self.project = project;
              self.comment = angular.copy(comment);
              self.commentForDisplay = self.comment.comment;
              self.comment.documents = angular.copy(docs);
              self.isPublic = self.period.periodType === 'Public';
              self.canUpdate = (self.period.userCan.classifyComments || self.period.userCan.vetComments);
              self.rejectedReasons = ['', 'Unsuitable Language', 'Quoting Third Parties', 'Petitions', 'Personally Identifying Information', 'Other'];
              self.filterCommentPackage = filterCommentPackage;

              self.userRoles = userRoles;
              self.hasRole = function (role) {
                return _.includes(self.userRoles, role);
              };
              self.totalStatus = true;
              self.attachmentStatus = true;
              self.oneDocPublished = false;

              self.showAlert = false;
              if (self.period.userCan.vetComments && self.comment.eaoStatus !== 'Unvetted') {
                // we've changed the status from the default.
                if (self.comment.eaoStatus === 'Deferred') {
                  self.alertType = 'label-info';
                  self.alertNotesLabel = 'Deferred';
                  self.alertNotes = self.comment.eaoNotes;
                } else if (self.comment.eaoStatus === 'Published') {
                  self.alertType = 'label-success';
                  self.alertNotesLabel = 'Published';
                  self.alertNotes = self.comment.publishedNotes;
                } else if (self.comment.eaoStatus === 'Rejected') {
                  self.alertType = 'label-danger';
                  self.alertNotesLabel = 'Rejected';
                  self.alertReasonLabel = 'Reason for Rejection';
                  self.alertReason = self.comment.rejectedReason;
                  self.alertNotes = self.comment.rejectedNotes;
                }
                self.showAlert = !_.isEmpty(self.alertType);
              }

              self.cancel = function () {
                $uibModalInstance.dismiss('cancel');
              };
              self.ok = function () {
                $uibModalInstance.close(self.comment);
              };
              self.pillars = self.comment.pillars.map(function (e) {
                return e;
              });
              // NICK: dont need or ever use this??
              // self.vcs = self.comment.valuedComponents.map(function (e) {
              //   return e.name;
              // });

              self.statusChange = function (status) {
                self.comment.eaoStatus = status;
                self.statusSync();
              };

              self.fileStatusChange = function (status, file) {
                // do not allow a change to Published if it is Rejected and comment is rejected
                if ('Published' === status && self.comment.eaoStatus === 'Rejected') {
                  // don't allow this change...
                } else {
                  file.eaoStatus = status;
                }
                self.statusSync();
              };

              self.statusSync = function () {
                var oneUnvetted = false;
                self.totalStatus = true;
                self.hasPublishableComment = false;
                self.oneDocPublished = false;
                self.errorMessage = '';
                _.forEach(self.comment.documents, function (file) {
                  file.vetted = file.eaoStatus === 'Published' || file.eaoStatus === 'Rejected';
                  oneUnvetted = file.vetted === false ? true : oneUnvetted;
                  self.oneDocPublished = file.eaoStatus === 'Published' ? true : self.oneDocPublished;
                });
                self.attachmentStatus = !oneUnvetted;

                if (self.oneDocPublished || self.comment.comment !== PLEASE_SEE) {
                  self.hasPublishableComment = true;
                }
                if (self.comment.eaoStatus === 'Published') {
                  if (!self.attachmentStatus) {
                    self.errorMessage = MUST_VET_ATTACHMENTS;
                    self.totalStatus = false;
                  }
                  if (self.hasPublishableComment) {
                    // no op .. this is good.
                  } else {
                    self.errorMessage = MUST_HAVE_PUBLISHABLE;
                    self.totalStatus = false;
                  }
                }
                self.commentForm.$setValidity('totalStatus', self.totalStatus);
              };

              // called by the ng-init in the form to pass the form into this controller for validation of attachments
              self.setForm = function (form) {
                self.commentForm = form;
              };

              self.submitForm = function (isValid) {
                // check to make sure the form is completely valid
                if (isValid) {
                  // replace "please see" with "no comment" if there are no published attachments
                  if (!self.oneDocPublished && self.comment.comment === PLEASE_SEE) {
                    self.comment.comment = NO_COMMENT;
                  }
                  $uibModalInstance.close(self.comment);
                }
              };

              /******************* START **********************************
              * NEW VC Logic utilizing the AI Suggested Valued Components *
              *************************************************************/
              // filter out unpublished allowed valued components from the list of all allowed valued components on the project
              self.allowedValuedComponents = [];
              _.forEach(projectValuedComponents, function (projectVC) {
                if (projectVC.isPublished) {
                  self.allowedValuedComponents.push(projectVC);
                }
              });

              // parses the suggested valued components for the entire comment
              self.parseGlobalSuggestedValuedComponents = function() {
                // for each of the global suggestions (for the comment as a whole)
                _.forEach(_.get(self.comment, 'suggestedValuedComponents.predictions.data.global'), function (suggestedVCObj) {
                  // for each of the valued components that are enabled for the project
                  _.forEach(self.allowedValuedComponents, function (allowedVC) {
                    // convert the allowed valued component name and title to lowercase with underscores and compare to the suggested valued component name
                    if (allowedVC.name.split(' ').join('_').toLowerCase() == suggestedVCObj.name || allowedVC.title.split(' ').join('_').toLowerCase() == suggestedVCObj.name) {
                      // a match is found, add the suggested valued component similarity and confidence to the allowed valued component
                      allowedVC.similarity = suggestedVCObj.similarity;
                      allowedVC.confidence = suggestedVCObj.confidence;
                      allowedVC.predictionType = 'global';
                      return false;
                    }
                  });
                });
              }

              // parses the suggested valued components for each sentence of the comment
              self.parseLocalSuggestedValuedComponents = function() {
                self.suggestedSentenceVCs = {};

                // for each of the local suggestions (for the comment sentences)
                _.forEach(_.get(self.comment, 'suggestedValuedComponents.predictions.data.local'), function (suggestedVCObj) {
                  // for each of the valued components that are enabled for the project
                  _.forEach(self.allowedValuedComponents, function (allowedVC) {
                    // only check local predictions if they have a matching global prediction, indicated by the existence of a confidence or similarity property.
                    if (_.get(allowedVC, 'confidence')) {
                      // convert the allowed valued component name and title to lowercase with underscores and compare to the suggested valued component name
                      if (allowedVC.name.split(' ').join('_').toLowerCase() == suggestedVCObj.name || allowedVC.title.split(' ').join('_').toLowerCase() == suggestedVCObj.name) {

                        /*
                        * example of suggestedSentenceVCs data structure, which ensures each unique vc._id has a unique set of start and end objects:
                        * {
                        *    37129381628361923: {
                        *       010: {
                        *          start_char: 0
                        *          end_char: 10
                        *       },
                        *      1535: {
                        *         start_char: 15
                        *         end_char: 35
                        *      }
                        *    },
                        *    1209381902839012: {
                        *       ...
                        *    },
                        *    ...
                        * }
                        */
                        if (!self.suggestedSentenceVCs.hasOwnProperty(allowedVC._id)) {
                          self.suggestedSentenceVCs[allowedVC._id] = {};
                        }
                        var key = "" + suggestedVCObj.start_char + suggestedVCObj.end_char; // concat the start and end index, as a string, to act as a unique key
                        self.suggestedSentenceVCs[allowedVC._id][key] = { start_char: suggestedVCObj.start_char, end_char: suggestedVCObj.end_char }; // append an object containing the start and end index
                      }
                    }
                  });
                });
              }


              // parses the suggested valued components for each sentence of the comment
              self.parseKeywordSuggestedValuedComponents = function() {
                self.suggestedKeywordVCs = {};

                // for each of the local suggestions (for the comment sentences)
                _.forEach(_.get(self.comment, 'suggestedValuedComponents.predictions.data.keyword'), function (suggestedVCObj) {
                  // for each of the valued components that are enabled for the project
                  _.forEach(self.allowedValuedComponents, function (allowedVC) {
                    // only check keyword predictions if they do not have a matching global prediction, indicated by the existence of a confidence or similarity property.
                    if (!_.get(allowedVC, 'confidence')) {
                      // convert the allowed valued component name and title to lowercase with underscores and compare to the suggested valued component name
                      if (allowedVC.name.split(' ').join('_').toLowerCase() == suggestedVCObj.name || allowedVC.title.split(' ').join('_').toLowerCase() == suggestedVCObj.name) {
                        /*
                        * example of suggestedKeywordVCs data structure, which ensures each unique vc._id has a unique set of start and end objects:
                        * {
                        *    37129381628361923: {
                        *       010: {
                        *          start_char: 0
                        *          end_char: 10
                        *       },
                        *      1535: {
                        *         start_char: 15
                        *         end_char: 35
                        *      }
                        *    },
                        *    1209381902839012: {
                        *       ...
                        *    },
                        *    ...
                        * }
                        */
                        if (!self.suggestedKeywordVCs.hasOwnProperty(allowedVC._id)) {
                          self.suggestedKeywordVCs[allowedVC._id] = {};
                        }
                        var key = "" + suggestedVCObj.start_char + suggestedVCObj.end_char; // concat the start and end index, as a string, to act as a unique key
                        self.suggestedKeywordVCs[allowedVC._id][key] = { start_char: suggestedVCObj.start_char, end_char: suggestedVCObj.end_char }; // append an object containing the start and end index

                        allowedVC.predictionType = 'keyword';
                        return false;
                      }
                    }
                  });
                });
              }

              self.toggleSentenceHighlight = function(vcID, vcType) {
                // reset commentForDisplay to the raw comment
                self.commentForDisplay = self.comment.comment;

                var stringsToHighlight = null;

                // determine if this VC should toggle the sentence or keyword highlights (currently only one type of highlighting is supported per VC).
                if (vcType === 'global') {
                  stringsToHighlight = self.suggestedSentenceVCs[vcID];
                } else if (vcType === 'keyword') {
                  stringsToHighlight = self.suggestedKeywordVCs[vcID];
                }

                if(stringsToHighlight) {
                  // get an array of keys in reverse order.
                  // this is necessary because we must add the tags to the comment from bottom to top, so as not to offset the start and end indexs.
                  var keysInDescOrder = _.sortBy(Object.keys(stringsToHighlight), function(val){
                    return parseInt(val);
                  }).reverse();
                  // add highlight tags based on current hovered VC
                  _.forEach(keysInDescOrder, function(key){
                    self.commentForDisplay = [self.commentForDisplay.slice(0, stringsToHighlight[key].end_char), '</b>', self.commentForDisplay.slice(stringsToHighlight[key].end_char)].join('');
                    self.commentForDisplay = [self.commentForDisplay.slice(0, stringsToHighlight[key].start_char), '<b class="highlight">', self.commentForDisplay.slice(stringsToHighlight[key].start_char)].join('');
                  });
                }
              }

              // parse the suggested valued components if the suggestedValuedComponents element exists
              if (self.comment.suggestedValuedComponents) {
                // currently the order of these calls matters, and should not be changed (global > local > keyword)
                self.parseGlobalSuggestedValuedComponents();
                self.parseLocalSuggestedValuedComponents();
                self.parseKeywordSuggestedValuedComponents();
              }

              // update the valued components, topics, and pillars fields based on the current UI selections
              self.updateValuedComponentSelection = function (vcID) {
                var index = self.comment.valuedComponents.indexOf(vcID);
                if (index !== -1) {
                  // VC is in the array, remove it
                  self.comment.valuedComponents.splice(index, 1);
                } else {
                  // VC is not in the array, add it and any parents
                  self.comment.valuedComponents.push(vcID);
                  self.addParentValuedComponents(vcID);
                }

                // finally, update topics and pillars
                self.updateTopicsAndPillars();
              }

              // recursively adds the parent valued components, if any, given an initial child valued component _id
              self.addParentValuedComponents = function(childVCID) {
                var childTopic = self.getTopicByValuedComponentID(childVCID);
                // console.log('childTopic: ', childTopic); //eslint-disable-line
                if (!childTopic) {
                  return;
                }

                var parentTopicCode = childTopic.parent;
                if (!parentTopicCode) {
                  return;
                }

                var parentTopic = self.getTopicByCode(parentTopicCode);
                if (!parentTopic) {
                  return;
                }

                var parentVC = self.getValuedComponentByName(parentTopic.name);
                if (!parentVC) {
                  return;
                }

                // add parent if not already in the array
                var index = self.comment.valuedComponents.indexOf(parentVC._id);
                if (index === -1) {
                  self.comment.valuedComponents.push(parentVC._id);
                }
                // recurse passing the current parent _id as the new child _id
                self.addParentValuedComponents(parentVC._id);
              }

              // update the topics and pillars based on the current valued components
              self.updateTopicsAndPillars = function () {
                self.comment.topics = [];
                self.comment.pillars = [];

                _.forEach(self.comment.valuedComponents, function (vcID) {
                  var valuedComponentObj = self.getValuedComponentByID(vcID);
                  if (valuedComponentObj) {
                    self.comment.topics.push(valuedComponentObj.title);
                    self.comment.pillars.push(valuedComponentObj.pillar);
                  }
                })

                self.comment.topics = _.uniq(self.comment.topics);
                self.comment.pillars = _.uniq(self.comment.pillars);
              }

              // Returns true if the array contains the valued component _id, false otherwise
              self.isSelectedValuedComponent = function (vcID) {
                return self.comment.valuedComponents.indexOf(vcID) !== -1;
              }

              // Given a valued component _id, return the full valued component object.
              self.getValuedComponentByID = function (vcID) {
                return self.allowedValuedComponents.find(function (allowedVC) {
                  return allowedVC._id === vcID
                });
              }

              // Given a valued component _id, return the full valued component object.
              self.getValuedComponentByName = function (vcName) {
                return self.allowedValuedComponents.find(function (allowedVC) {
                  return allowedVC.name === vcName
                });
              }

              // Get a topic for a given valued component _id, return the full topic object.
              self.getTopicByValuedComponentID = function(vcID) {
                var vc = self.getValuedComponentByID(vcID);
                return allSystemTopics.find(function(topic) {
                  return (
                    topic.name === vc.name &&
                    topic.pillar === vc.pillar
                  );
                });
              };

              // Get a topic by topic.code, return the full topic object.
              self.getTopicByCode = function(topicCode) {
                return allSystemTopics.find(function(topic) {
                  return topic.code === topicCode
                });
              };
              /************************************************************
              * NEW VC Logic utilizing the AI Suggested Valued Components *
              ********************* END ***********************************/
            },
          })
            .result.then(function (data) {
              return Promise.resolve()
                .then(function () {
                  // Set proponent status flag
                  data.proponentStatus = (data.pillars.length > 0) ? 'Classified' : 'Unclassified';
                })
                .then(function () {
                  // Process provincial documents
                  return data.documents.reduce(function (current, value) {
                    return CommentModel.updateDocument(value);
                  }, Promise.resolve());
                })
                .then(function () {
                  // Save changes to the comment
                  return CommentModel.save(data);
                })
                .then(function () {
                  if(data.suggestedValuedComponents) {
                    // NEW VC Logic utilizing the AI Suggested Valued Components
                    // Post chosen VC's back to AI bot.  No data is returned in response.
                    return CommentModel.submitChosenVCsToAIBot(data._id)
                      .catch(function() {
                        // swallow error
                        // failing to call the AI to submit VCs should not prevent the rest of the update from succeeding.
                      });
                  }
                })
                .then(function () {
                  // Reload UI data
                  $scope.smartTableCtrl.pipe($scope.smartTableCtrl.tableState());
                });
            })
            .catch(function () {
              // swallow error
            });
        };
      }
    };
  })
  /*
   Support for displaying a list of files to be uploaded and wrap the upload process
   */
  .directive('fileUploadListing', ['_', function (_) {
    return {
      restrict: 'E',
      scope: {
        fileList: '='
      },
      templateUrl: 'modules/documents/client/views/partials/file-upload-listing.html',
      controllerAs: 'vm',
      controller: function ($scope) {
        var self = this;
        self.fileList = $scope.fileList || [];

        self.removeFile = removeFile;

        function removeFile(f) {
          _.remove(self.fileList, f);
        }
      }
    };
  }])
  // -------------------------------------------------------------------------
  //
  // add a public comment
  //
  // -------------------------------------------------------------------------
  .directive('addPublicComment', function ($uibModal, CommentModel, Upload, $timeout, _, $state, DnDBackgroundBlockService) {
    return {
      restrict: 'A',
      scope: {
        project: '=',
        period: '='
      },
      link: function (scope, element, attrs) {
        DnDBackgroundBlockService.addEventListeners();
        element.on('click', function () {
          var modal;
          if (scope.period.periodType === 'Public') {
            modal = new PublicCommentPeriodModal($uibModal, CommentModel, Upload, $timeout, _, $state, scope, element, attrs, DnDBackgroundBlockService);
          }
          modal.show();
        });
      }
    };
  })
  // -------------------------------------------------------------------------
  //
  // add an open house thingamabob
  //
  // -------------------------------------------------------------------------
  .directive('editOpenHouse', function ($uibModal) {
    return {
      restrict: 'A',
      scope: {
        period: '=',
        openhouse: '=',
        mode: '@',
        index: '='
      },
      link: function (scope, element) {
        element.on('click', function () {
          if (scope.mode === 'delete') {
            scope.period.openHouses.splice(scope.index, 1);
            scope.$apply();
          } else {
            $uibModal.open({
              animation: true,
              templateUrl: 'modules/project-comments/client/views/public-comments/open-house-edit.html',
              controllerAs: 's',
              size: 'md',
              windowClass: 'public-comment-modal',
              controller: function ($scope, $uibModalInstance, moment, _) {
                var s = this;
                s.period = scope.period;
                s.project = scope.project;
                s.openHouse = scope.openhouse;
                if (scope.mode === 'add') {
                  s.openHouse = {
                    eventDate: new Date(),
                    description: ''
                  };
                }
                s.cancel = function () {
                  $uibModalInstance.dismiss('cancel');
                };
                s.ok = function (isValid) {
                  if (!isValid) {
                    $scope.$broadcast('show-errors-check-validity', 'openHouseForm');
                    return false;
                  }
                  if (scope.mode === 'add') {
                    scope.period.openHouses.push(s.openHouse);
                  }
                  $uibModalInstance.close();
                };

                $scope.s.openHouse.eventDate = _.isEmpty(s.openHouse.eventDate) ? null : moment(s.openHouse.eventDate).toDate();

                $scope.datePicker = {
                  opened: false
                };
                $scope.dateOpen = function () {
                  $scope.datePicker.opened = true;
                };
                $scope.dateOptions = {
                  showWeeks: false
                };

              }
            })
              .result.then(function ( /* data */ ) {})
              .catch(function ( /* err */ ) {});
          }
        });
      }
    };
  })

  /*
   Validate the PCP before publishing.
   */
  .directive('pcpvalidationDialog', ['ConfirmService', 'AlertService', function (ConfirmService, AlertService) {
    return {
      restrict: 'A',
      scope: {
        titleText: '=',
        confirmText: '=',
        confirmItems: '=',
        okText: '=',
        cancelText: '=',
        onOk: '=',
        onCancel: '=',
        period: '='
      },
      link: function (scope, element) {
        element.on('click', function () {
          //getting start date and end dates
          var period = scope.period;
          var startdate = period.dateStarted;
          var end_date = period.dateCompleted;
          if (!period.informationLabel) {
            AlertService.error('"Information Being Commented On" field is empty');
          } else if (startdate > end_date) {
            AlertService.error('Start Date is greater than End Date. Please correct the Start Date');
          } else if (!startdate) {
            AlertService.error('Start Date is empty. Please choose Start Date');
          } else if (!end_date) {
            AlertService.error('End Date is empty. Please choose End Date');
          } else {
            /*
					 It is assumed the scope has been set up for the confirm dialog service. We just need to populate the okArg
					 */
            scope.okArgs = scope.period;
            ConfirmService.confirmDialog(scope);
          }
        });
      }
    };
  }]);

function PublicCommentPeriodModal($uibModal, CommentModel, Upload, $timeout, _, $state, scope, element, attrs, DnDBackgroundBlockService) {
  this.show = function () {
    DnDBackgroundBlockService.addEventListeners();
    $uibModal.open({
      animation: true,
      templateUrl: 'modules/project-comments/client/views/public-comments/add.html',
      controllerAs: 's',
      backdrop: 'static',
      size: 'lg',
      windowClass: 'public-comment-modal',
      resolve: {
        comment: function (CommentModel) {
          return CommentModel.getNew();
        }
      },
      controller: function ($rootScope, $scope, $uibModalInstance, comment) {
        var s = this;

        $scope.project = scope.project;

        var maxFileSize = 5 * 1024 * 1024; // 5MiB
        s.isAdmin = scope.period.userCan.publish; // Admins may upload larger filesizes for business reasons
        s.step = 1;
        s.comment = comment;
        comment.period = scope.period;
        comment.project = scope.project;
        comment.files = scope.files;
        comment.makeVisible = false;
        s.fileList = [];
        s.showAlert = false;
        s.showExtensionAlert = false;
        //eslint-disable-next-line no-useless-escape
        var acceptedExtentions = new RegExp('\.pdf$|\.png$|\.gif$|\.jpg$|\.jpeg$|\.bmp$'); // Whitelist for file extensions accpeted in comments.

        $scope.$watch('s.comment.files', function (newValue) {
          if (newValue) {
            s.showAlert = false;
            s.comment.inProgress = false;
            _.each(newValue, function (file) {
              if (file.size > maxFileSize && !s.isAdmin) {
                s.showAlert = true;
              } else if (!file.name.match(acceptedExtentions)) {
                s.showExtensionAlert = true;
              } else {
                s.fileList.push(file);
              }
            });
          }
        });

        s.comment.removeFile = function (f) {
          _.remove(s.fileList, f);
        };

        s.closeAlert = function () {
          s.showAlert = false;
          s.showExtensionAlert = false;
        };
        s.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };
        s.next = function () {
          s.step++;
        };
        s.ok = function () {
          $uibModalInstance.close(s.comment);
        };

        s.submit = function () {
          s.comment.inProgress = false;
          comment.isAnonymous = !comment.makeVisible;
          if (!s.comment.comment) {
            s.comment.comment = PLEASE_SEE; //if the comment is empty and has attachment
          }
          var docCount = s.fileList.length;

          if (!comment.author) {
            comment.isAnonymous = true; // if the author is empty make it anonymous
          }

          if (docCount === 0) {
            // We don't need to do anything but add the comment.
            CommentModel.add(s.comment)
              .then(function (comment) {
                s.step = 3;
                $scope.$apply();
                $rootScope.$broadcast('NEW_PUBLIC_COMMENT_ADDED', {
                  comment: comment
                });
                return null;
              })
              .catch(function ( /* err */ ) {
                s.step = 4;
                $scope.$apply();
              });
          } else {
            var uploadedDocs = [];
            // Upload docs
            angular.forEach(s.fileList, function (file) {
              // Quick hack to pass objects
              file.upload = Upload.upload({
                url: '/api/commentdocument/' + comment.project._id + '/upload',
                file: file
              });

              file.upload.then(function (response) {
                $timeout(function () {
                  file.result = response.data;
                  uploadedDocs.push(response.data._id);
                  // when the last file is finished, send complete event.
                  if (--docCount === 0) {
                    _.each(uploadedDocs, function (d) {
                      s.comment.documents.push(d);
                    });

                    CommentModel.add(s.comment)
                      .then(function (comment) {
                        s.step = 3;
                        $scope.$apply();
                        $rootScope.$broadcast('NEW_PUBLIC_COMMENT_ADDED', {
                          comment: comment
                        });
                      })
                      .catch(function ( /* err */ ) {
                        s.step = 4;
                        $scope.$apply();
                      });
                  }
                });
              }, function (response) {
                if (response.status > 0) {
                  // some error
                } else {
                  _.remove($scope.s.comment.files, file);
                }
              }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
              });
            });
          }
        };
      }
    })
      .result.then(function (data) {
        DnDBackgroundBlockService.removeEventListeners();
        // Redirect to full PCP page
        $state.transitionTo('p.commentperiod.detail', {
          projectid: scope.project.code,
          periodId: data.period._id
        }, {
          reload: true,
          inherit: false,
          notify: true
        });
      })
      .catch(function ( /* err */ ) {
        DnDBackgroundBlockService.removeEventListeners();
      });
  };
}
