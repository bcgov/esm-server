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
angular.module ('comment')
// -------------------------------------------------------------------------
//
// list of public comments from the point of view of the public
//
// -------------------------------------------------------------------------
.directive ('tmplPublicCommentList', function ($uibModal, _) {
	return {
		scope: {
			period    : '=',
			project   : '=',
			userRoles : '='
		},
		restrict: 'E',
		templateUrl : 'modules/project-comments/client/views/public-comments/list.html',
		controllerAs: 's',
		controller: function ($scope, $filter, NgTableParams, Authentication, CommentModel, UserModel, CommentPeriodModel, _) {
			var s = this;
			var project = s.project = $scope.project;
			var period  = s.period  = $scope.period;
			var userRoles = s.userRoles = $scope.userRoles || [];

			s.topicsArray = [];
			s.pillarsArray = [];
			s.showTopicCloud = false;

			s.isJoint = period.periodType === 'Joint';
			s.isPublic = period.periodType === 'Public';

			s.hasRole = function (role) { return _.includes(userRoles, role); };
			s.hasCeeaRole = s.hasRole('assessment-ceaa');

			s.filterCommentOptions = [
				{ name: 'All', displayName: 'Show All Comments' },
				{ name: 'Provincial', displayName: 'Comments on ' + period.informationLabel },
				{ name: 'Federal', displayName: 'Comments on ' + period.ceaaInformationLabel }
			];

			s.selectedCommentFilterOption = s.filterCommentOptions[0];
			s.filterCommentPackage = s.selectedCommentFilterOption.name;

			s.changeFilterCommentPackage = function () {
				s.isLoading = true;
				s.filterCommentPackage = s.selectedCommentFilterOption.name;
				$scope.smartTableCtrl.pipe($scope.smartTableCtrl.tableState());
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
					result.push({ id: t, name: t });
				}, []);

				var pillarList = _.transform(allPillars, function (result, p) {
					result.push({ id: p, name: p });
				}, []);

				// jsherman - 20160804: need an empty one for chrome, so we can de-select the filter...
				// adds a bogus one to safari and IE though:( so put at the bottom.
				topicList.push({ id: '', name: '' });
				angular.copy(topicList, s.topicsArray);
				// as above...
				pillarList.push({ id: '', name: '' });
				angular.copy(pillarList, s.pillarsArray);

				var topicCloud = _.transform(sortedTopics, function (result, t) {
					result.push({ name: t._id, size: t.count });
				}, []);

				s.refreshVisualization = 1;
				// This is an example of what the tag cloud expects
				// s.commentsByTopicVis = { name: 'byTopic', children:[
				// 	{name: "Thing 1", size: 1},
				// 	{name: "Thing 2", size: 2},
				// 	{name: "Cat in the Hat", size: 3},
				// ]};
				s.commentsByTopicVis = { name: 'byTopic', children: topicCloud };
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
				s.eaoStatus ='Unvetted';
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
			s.colspan = 3 + (s.isPublic ? 2 : 0) + ($scope.authentication.user ? 1 : 0);
			s.pageSize = 50;

			// filterByFields
			// used for binding...
			var filterBy = {
				period: s.period._id,
				eaoStatus: undefined,
				proponentStatus: undefined,
				isPublished: true
			};

			// mostly this is so the value in the drop down lists displays what is in the tableState.search.predicateObject
			var filterByFields = {
				commentId: undefined,
				authorComment: undefined,
				location: undefined,
				pillar: undefined,
				topic: undefined
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

				var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
				var limit = pagination.number || s.pageSize;  // Number of entries showed per page.

				// set the primary query - PUBLIC users
				var filterBy = { period: s.period._id, eaoStatus: undefined, proponentStatus: undefined, isPublished: true };

				// EAO role - user with vetting permissions
				if (s.period.userCan.vetComments) {
					filterBy = { period: s.period._id, eaoStatus: s.eaoStatus, proponentStatus: undefined, isPublished: undefined };
				}

				// CEAA role - only applies to joint PCP
				// EPIC-1021 Ensure CEAA can only see Published and Rejected comments, nothing more
				if (s.isJoint && s.hasCeeaRole) {
					if (!_.contains(['Published', 'Rejected'], s.eaoStatus)) {
						s.eaoStatus = 'Published';
					}
					filterBy = { period: s.period._id, eaoStatus: s.eaoStatus, proponentStatus: undefined, isPublished: undefined };
				}

				// PROPONENT role
				if (s.period.userCan.classifyComments && !s.period.userCan.vetComments) {
					if (s.proponentStatus === 'Classified') {
						filterBy = { period: s.period._id, eaoStatus: undefined, proponentStatus: 'Classified', isPublished: true };
					} else {
						filterBy = { period: s.period._id, eaoStatus: undefined, proponentStatus: 'Unclassified', isPublished: true };
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
				}

				CommentPeriodModel.getForPublic(s.period._id)
				.then(function (p) {
					refreshFilterArrays(p);
					return CommentModel.getCommentsForPeriod(
						filterBy.period, filterBy.eaoStatus, filterBy.proponentStatus, filterBy.isPublished,
						filterByFields.commentId, filterByFields.authorComment, filterByFields.location, filterByFields.pillar, filterByFields.topic,
						start, limit, sort.predicate, sort.reverse, s.filterCommentPackage);
				})
				.then(function (result) {
					_.each(result.data, function (item) {
						var publishedCount = function (item) {
							var combined = item.documents.concat(item.ceaaDocuments);
							var count = _.reduce(combined, function (total, doc) {
								return doc.eaoStatus === 'Published' ? total + 1 : total;
							}, 0);

							return count;
						};
						var docCount = item.documents.length + item.ceaaDocuments.length;
						item.publishedDocumentCount = period.userCan.vetComments ? docCount : publishedCount(item);
						item.authorAndComment = item.isAnonymous ? item.comment : item.author + ' ' + item.comment;
					});

					s.displayed = result.data;
					tableState.pagination.start = start;
					tableState.pagination.totalItemCount = result.count;
					tableState.pagination.numberOfPages = Math.ceil(result.count / limit); //set the number of pages so the pagination can update
					s.isLoading = false;
					$scope.$apply();
				});
			};

			s.downloadCommentData = function (isJoint) {
				var getBrowser = function () {
					var userAgent = window.navigator.userAgent;

					// Feature detection method
					if (Object.hasOwnProperty.call(window, "ActiveXObject") && !window.ActiveXObject) {
						return 'ie';
					}
					if (navigator.appVersion.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident") !== -1 || navigator.appVersion.indexOf("Edge") !== -1) {
						return 'ie';
					}

					var browsers = { chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i };
					for (var key in browsers) {
						if (browsers[key].test(userAgent)) {
							return key;
						}
					}
				};

				var onlyPublishedComments = true;
				var canSeeRejectedDocs = false;

				// Only EAO staff (or whoever has permissions to vet comments) should be able to see unpublished comments
				// For Joint PCPs, CEAA should also be allowed to download rejected comments and docs
				if (s.period.userCan.vetComments || s.hasCeeaRole) {
					onlyPublishedComments = undefined;
					canSeeRejectedDocs = true;
				}

				// console.log("data:", s.tableParams.data);
				// Return a promise with the CSV data to download
				CommentPeriodModel.getForPublic(s.period._id)
				.then(function (p) {
					refreshFilterArrays(p);
					return CommentModel.getCommentsForPeriod(
						s.period._id, undefined, undefined, onlyPublishedComments,
						undefined, undefined, undefined, undefined, undefined,
						0, s.total, 'commentId', true, undefined);
				})
				.then(function (result) {
					CommentModel.prepareCSV(result.data, isJoint, canSeeRejectedDocs)
					.then(function (data) {
						var blob = new Blob([data], { type: 'octet/stream' });
						var filename = 'EAO_PCP_Comments.csv';
						var browse = getBrowser();
						if (browse === 'firefox') {
							var ff = angular.element('<a/>');
							ff.css({ display: 'none' });
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
							var safariBlob = new Blob([data], { type: 'text/csv;base64' });
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
			s.detail = function (comment, filterCommentPackage) {
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
						ceaaDocs: function () {
							// Documents related to the Federal package within a joint PCP
							// Will be an empty array for regular PCP
							return CommentModel.getCeaaDocuments(comment._id);
						}
					},
					controller: function ($scope, $uibModalInstance, docs, ceaaDocs) {
						var self = this;
						self.period = period;
						self.project = project;
						self.comment = angular.copy(comment);
						self.comment.documents = angular.copy(docs);
						self.comment.ceaaDocuments = angular.copy(ceaaDocs);
						self.isJoint = self.period.periodType === 'Joint';
						self.isPublic = self.period.periodType === 'Public';
						self.canUpdate = (self.period.userCan.classifyComments || self.period.userCan.vetComments);
						self.rejectedReasons = ['', 'Unsuitable Language', 'Quoting Third Parties', 'Petitions', 'Personally Identifying Information'];
						self.filterCommentPackage = filterCommentPackage;

						self.userRoles = userRoles;
						self.hasRole = function(role) { return _.includes(self.userRoles, role); };
						self.hasCeeaRole = self.hasRole('assessment-ceaa');
						self.totalStatus = true;
						self.attachmentStatus = true;
						self.oneDocPublished = false;
						self.oneCeaaPublished = false;

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

						self.cancel = function () { $uibModalInstance.dismiss('cancel'); };
						self.ok = function () { $uibModalInstance.close(self.comment); };
						self.pillars = self.comment.pillars.map(function (e) { return e; });
						self.vcs = self.comment.valuedComponents.map(function (e) { return e.name; });

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

						self.statusSync = function() {
							var oneUnvetted = false;
							console.log("status sync");
							self.totalStatus = true;
							self.hasPublishableComment = false;
							self.hasPublishableCeaaComment = false;
							self.oneDocPublished = false;
							self.oneCeaaPublished = false;
							self.errorMessage = '';
							_.forEach(self.comment.documents, function(file) {
								file.vetted = file.eaoStatus === 'Published' || file.eaoStatus === 'Rejected';
								oneUnvetted = file.vetted === false ? true : oneUnvetted;
								self.oneDocPublished = file.eaoStatus === 'Published' ? true : self.oneDocPublished;
							});
							_.forEach(self.comment.ceaaDocuments, function(file) {
								file.vetted = file.eaoStatus === 'Published' || file.eaoStatus === 'Rejected';
								oneUnvetted = file.vetted === false ? true : oneUnvetted;
								self.oneCeaaPublished = file.eaoStatus === 'Published' ? true : self.oneCeaaPublished;
							});
							self.attachmentStatus = !oneUnvetted;

							if (self.oneDocPublished || self.comment.comment !== PLEASE_SEE) {
								self.hasPublishableComment = true;
							}
							if (self.oneCeaaPublished || self.comment.ceeaComment !== PLEASE_SEE) {
								self.hasPublishableCeaaComment = true;
							}
							if (self.comment.eaoStatus === 'Published') {
								if (!self.attachmentStatus) {
									self.errorMessage = MUST_VET_ATTACHMENTS;
									self.totalStatus = false;
								} if (self.hasPublishableComment || self.hasPublishableCeaaComment) {
									// no op .. this is good.
								} else {
									self.errorMessage = MUST_HAVE_PUBLISHABLE;
									self.totalStatus = false;
								}
							}
							// console.log("status ", self.totalStatus, self.errorMessage);
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
								if (!self.oneCeaaPublished && self.comment.ceeaComment === PLEASE_SEE) {
									self.comment.ceeaComment = NO_COMMENT;
								}
								$uibModalInstance.close(self.comment);
							}
						};
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
						return data.documents.reduce(function (current, value, index) {
							return CommentModel.updateDocument(value);
						}, Promise.resolve());
					})
					.then(function () {
						// Process federal (CEAA) documents
						return data.ceaaDocuments.reduce(function (current, value, index) {
							return CommentModel.updateDocument(value);
						}, Promise.resolve());
					})
					.then(function () {
						// Save changes to the comment
						return CommentModel.save(data);
					})
					.then(function () {
						// Reload UI data
						$scope.smartTableCtrl.pipe($scope.smartTableCtrl.tableState());
					});
				})
				.catch (function (err) {
					console.error(err);
				});
			};
		}
	};
})
/*
 Support for displaying a list of files to be uploaded and wrap the upload process
 */
.directive('fileUploadListing', ['_', 'DocumentsUploadService', function (_, DocumentsUploadService) {
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
.directive ('addPublicComment', function ($uibModal, CommentModel, Upload, $timeout, _, $state, DnDBackgroundBlockService) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			period : '='
		},
		link : function(scope, element, attrs) {
			DnDBackgroundBlockService.addEventListeners();
			element.on('click', function () {
				// Either regular PCP or joint PCP
				var modal;
				if (scope.period.periodType === 'Joint') {
					modal = new JointCommentPeriodModal($uibModal, CommentModel, Upload, $timeout, _, $state, scope, element, attrs, DnDBackgroundBlockService);
				} else if (scope.period.periodType === 'Public') {
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
.directive ('editOpenHouse', function ($uibModal) {
	return {
		restrict: 'A',
		scope: {
			period : '=',
			openhouse : '=',
			mode   : '@',
			index  : '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function () {
				if (scope.mode === 'delete') {
					scope.period.openHouses.splice (scope.index, 1);
					scope.$apply();
				}
				else {
					$uibModal.open ({
						animation: true,
						templateUrl: 'modules/project-comments/client/views/public-comments/open-house-edit.html',
						controllerAs: 's',
						size: 'md',
						windowClass: 'public-comment-modal',
						controller: function ($scope, $uibModalInstance) {
							var s     = this;
							s.period = scope.period;
							s.project = scope.project;
							s.openHouse = scope.openhouse;
							if (scope.mode === 'add') {
								s.openHouse = {
									eventDate   : new Date (),
									description : ''
								};
							}
							s.cancel  = function () { $uibModalInstance.dismiss ('cancel'); };
							s.ok      = function () {
								if (scope.mode === 'add') {
									scope.period.openHouses.push (s.openHouse);
								}
								$uibModalInstance.close ();
							};
						}
					})
					.result.then (function (data) {
					})
					.catch (function (err) {});
				}
			});
		}
	};
})

/*
 Validate the PCP before publishing.
 */
.directive('pcpvalidationDialog', ['ConfirmService','AlertService', function (ConfirmService, AlertService) {
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
		link: function (scope, element, attrs) {
			element.on('click', function () {
				//getting start date and end dates
				var period = scope.period;
				var startdate = period.dateStarted;
				var end_date = period.dateCompleted;
				if (!period.informationLabel){
					AlertService.error('Related documents information is empty');
				}
				else if (startdate > end_date){
					AlertService.error('Start Date is greater than End Date. Please correct the Start Date');
				}
				else if (!startdate){
					AlertService.error('Start Date is empty. Please choose Start Date');
				}
				else if (!end_date){
					AlertService.error('End Date is empty. Please choose End Date');
				}
				else {
					/*
					 It is assumed the scope has been set up for the confirm dialog service. We just need to populate the okArg
					 */
					scope.okArgs = scope.period;
					ConfirmService.confirmDialog(scope);
				}
			});
		}
	};
}])
;

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

				var maxFileSize = 5 * 1024 * 1024; //5MB

				s.step = 1;
				s.comment = comment;
				comment.period = scope.period;
				comment.project = scope.project;
				comment.files = scope.files;
				comment.makeVisible = false;
				s.fileList = [];
				s.showAlert = false;
				s.showExtensionAlert = false;
				var acceptedExtentions = new RegExp('\.pdf$|\.png$|\.gif$|\.jpg$|\.jpeg$|\.bmp$'); // Whitelist for file extensions accpeted in comments.

				$scope.$watch('s.comment.files', function (newValue) {
					if (newValue) {
						s.showAlert = false;
						s.comment.inProgress = false;
						_.each(newValue, function (file, idx) {							
							if (file.size > maxFileSize) {
								s.showAlert = true;
							} else if (!file.name.match(acceptedExtentions)){
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
				s.cancel = function () { $uibModalInstance.dismiss('cancel'); };
				s.next = function () { s.step++; };
				s.ok = function () { $uibModalInstance.close(s.comment); };

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

					if (docCount === 0 ) {
						// We don't need to do anything but add the comment.
						CommentModel.add(s.comment)
						.then (function (comment) {
							s.step = 3;
							$scope.$apply();
							$rootScope.$broadcast('NEW_PUBLIC_COMMENT_ADDED', { comment: comment });
							return null;
						})
						.catch(function (err) {
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
											$rootScope.$broadcast('NEW_PUBLIC_COMMENT_ADDED', { comment: comment });
										})
										.catch(function (err) {
											s.step = 4;
											$scope.$apply();
										});
									}
								});
							}, function (response) {
								if (response.status > 0) {
									// docUpload.errorMsg = response.status + ': ' + response.data;
									console.error("error data:", response.data);
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
			$state.transitionTo('p.commentperiod.detail', { projectid: scope.project.code, periodId: data.period._id }, {
				reload: true, inherit: false, notify: true
			});
		})
		.catch (function (err) {
			DnDBackgroundBlockService.removeEventListeners();
			console.error(err);
		});
	};
}

function JointCommentPeriodModal($uibModal, CommentModel, Upload, $timeout, _, $state, scope, element, attrs, DnDBackgroundBlockService) {
	this.show = function () {
		DnDBackgroundBlockService.addEventListeners();
		$uibModal.open({
			animation: true,
			templateUrl: 'modules/project-comments/client/views/joint-public-comments/submit-comment.html',
			controllerAs: 'ctrl',
			backdrop: 'static',
			size: 'lg',
			windowClass: 'public-comment-modal',
			resolve: {
				comment: function (CommentModel) {
					return CommentModel.getNew();
				}
			},
			controller: function ($rootScope, $scope, $uibModalInstance, comment) {

				var ctrl = this;

				// private
				function setupUIState() {
					// Make sure all files submitted are under 5MB
					$scope.$watch('ctrl.eaoPackage.files', function (newValue) {
						if (newValue) {
							ctrl.closeAlert();
							_.each(newValue, function (file, idx) {
								if (file.size > ctrl.maxFileSize) {
									ctrl.openAlert();
								} else {
									ctrl.eaoPackage.validFiles.push(file);
								}
							});
						}
					});
					$scope.$watch('ctrl.ceaaPackage.files', function (newValue) {
						if (newValue) {
							ctrl.closeAlert();
							_.each(newValue, function (file, idx) {
								if (file.size > ctrl.maxFileSize) {
									ctrl.openAlert();
								} else {
									ctrl.ceaaPackage.validFiles.push(file);
								}
							});
						}
					});
				}

				function openAlert() { ctrl.showAlert = true; }
				function closeAlert() { ctrl.showAlert = false; }
				function cancel() { $uibModalInstance.dismiss('cancel'); }
				function ok() { $uibModalInstance.close(ctrl.comment); }
				function back() { if (ctrl.step > 1) { ctrl.step--; } }
				function next() { ctrl.step++; }
				function removeFile(fileList, f) { _.remove(fileList, f); }

				function uploadFiles(url, fileList, target) {
					var docCount = fileList.length;
					if(docCount === 0) {
						return Promise.resolve();
					}
					return new Promise(function (resolve, reject) {
						_.forEach(fileList, function (file) {
							Upload.upload({
								url: url,
								file: file
							})
							.then(function (response) {
								file.result = response.data;
								target.push(response.data._id);
								if (--docCount === 0) {
									resolve(comment);
								}
							}, function (response) {
								console.error("error status:", response.status, response.data);
								reject(response);
							}, function (evt) {
								file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
							});
						});
					});
				}

				function submit() {
					// All comments are submitted anonymously by default. Unless the user agrees to show their name on the public site.
					var comment = ctrl.comment;
					ctrl.isBusy = true;
					comment.inProgress = false;
					comment.isAnonymous = !ctrl.makeVisible;
					if (!comment.comment && ctrl.eaoPackage.validFiles.length > 0) {
						comment.comment = PLEASE_SEE;
					}
					if (!comment.ceeaComment && ctrl.ceaaPackage.validFiles.length > 0) {
						comment.ceeaComment = PLEASE_SEE;
					}
					var url = '/api/commentdocument/' + comment.project._id + '/upload';

					// Upload the files and submit all captured data to server
					return uploadFiles(url, ctrl.eaoPackage.validFiles, comment.documents)
					.then(function () {
						return uploadFiles(url, ctrl.ceaaPackage.validFiles, comment.ceaaDocuments);
					})
					.then(function () {
						// Save the comment
						return CommentModel.add(comment);
					})
					.then(function (comment) {
						ctrl.isBusy = false;
						ctrl.step = 7;  // Success...
						$scope.$apply();
					})
					.catch(function (err) {
						ctrl.isBusy = false;
						ctrl.step = 8;  // Error...
						$scope.$apply();
					});
				}

				function hasNameAndLocation() {
					return ctrl.comment && ctrl.comment.author && ctrl.comment.location;
				}

				function isValid() {
					// As per EPIC-979: For the Submit button to be enabled, a Joint PCP must have:
					// Name, Location, and one or more of Comment_Provincial, Attachment_Provincial, Comment_Federal, Attachment_Federal
					var valid = true;
					var comment = ctrl.comment;

					if (!hasNameAndLocation()) {
						valid = false;
					}
					if (!comment.comment && ctrl.eaoPackage.validFiles.length === 0 &&
						!comment.ceeaComment && ctrl.ceaaPackage.validFiles.length === 0) {
						valid = false;
					}
					return valid;
				}

				// exports
				comment.period = scope.period;
				comment.project = scope.project;
				comment.files = [];

				setupUIState();

				angular.extend(ctrl, {
					step: 1,
					comment: comment,
					project: scope.project,
					period: scope.period,
					showAlert: false,
					makeVisible: false,
					maxFileSize: 5 * 1024 * 1024, // 5MB
					eaoPackage: {
						files: [],
						validFiles: []
					},
					ceaaPackage: {
						files: [],
						validFiles: []
					}
				});

				// methods
				angular.extend(ctrl, {
					openAlert: openAlert,
					closeAlert: closeAlert,
					cancel: cancel,
					ok: ok,
					back: back,
					next: next,
					submit: submit,
					removeFile: removeFile,
					hasNameAndLocation: hasNameAndLocation,
					isValid: isValid
				});
			}
		})
		.result.then(function (data) {
			DnDBackgroundBlockService.removeEventListeners();
			// Redirect to full PCP page
			$state.transitionTo('p.commentperiod.detail', { projectid: scope.project.code, periodId: data.period._id }, {
				reload: true, inherit: false, notify: true
			});
		})
		.catch(function (err) {
			DnDBackgroundBlockService.removeEventListeners();
			console.error(err);
		});
	};
}
