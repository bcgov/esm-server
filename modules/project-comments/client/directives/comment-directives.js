'use strict';
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
.directive ('tmplPublicCommentList', function ($modal, _) {
	return {
		scope: {
			period  : '=',
			project : '='
		},
		restrict: 'E',
		templateUrl : 'modules/project-comments/client/views/public-comments/list.html',
		controllerAs: 's',
		controller: function ($rootScope, $scope, $filter, NgTableParams, Authentication, CommentModel, UserModel, CommentPeriodModel, _) {
			var s       = this;
			var project = s.project = $scope.project;
			var period  = s.period  = $scope.period;

			s.topicsArray = [];
			s.pillarsArray = [];
			s.showTopicCloud = false;

			var refreshFilterArrays = function(p) {
				s.period = p;

				s.total         = p.stats.total;
				s.totalPublished = p.stats.totalPublished;
				s.totalPending  = p.stats.totalPending;
				s.totalDeferred = p.stats.totalDeferred;
				s.totalPublic   = p.stats.totalPublic;
				s.totalRejected = p.stats.totalRejected;
				s.totalAssigned   = p.stats.totalAssigned;
				s.totalUnassigned = p.stats.totalUnassigned;

				var sortedTopics = _.sortBy(s.period.topics, '_id');
				var sortedPillars = _.sortBy(s.period.pillars, '_id');

				var allTopics = _.pluck(sortedTopics, '_id');
				var allPillars = _.pluck(sortedPillars, '_id');

				var topicList = _.transform(allTopics, function(result, t) {
					result.push({id: t, name: t});
				}, []);

				var pillarList = _.transform(allPillars, function(result, p) {
					result.push({id: p, name: p});
				}, []);

				// jsherman - 20160804: need an empty one for chrome, so we can de-select the filter...
				// adds a bogus one to safari and IE though:( so put at the bottom.
				topicList.push({id: '', name: ''});
				angular.copy(topicList, s.topicsArray);
				// as above...
				pillarList.push({id: '', name: ''});
				angular.copy(pillarList, s.pillarsArray);


				var topicCloud = _.transform(sortedTopics, function(result, t) {
					result.push({name: t._id, size: t.count});
				}, []);

				s.refreshVisualization = 1;
				// This is an example of what the tag cloud expects
				// s.commentsByTopicVis = { name: 'byTopic', children:[
				// 	{name: "Thing 1", size: 1},
				// 	{name: "Thing 2", size: 2},
				// 	{name: "Cat in the Hat", size: 3},
				// ]};
				s.commentsByTopicVis = { name: 'byTopic', children: topicCloud};

			};

			$scope.authentication = Authentication;

			$scope.$on('NEW_PUBLIC_COMMENT_ADDED', function (e, data) {
				console.log('comment: ' + data.comment);

				// We shouldn't do this if we're public.
				if (period.userCan.vetComments) {
					//selectPage(currentPage);
				}
			});

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
			s.colspan = ($scope.authentication.user) ? 7 : 6;
			s.pageSize = 50;

			// filterByFields
			// used for binding...
			var filterBy = {
				period: s.period._id,
				eaoStatus: undefined,
				proponentStatus: undefined,
				isPublished: true};

			// mostly this is so the value in the drop down lists displays what is in the tableState.search.predicateObject
			var filterByFields = {
				commentId: undefined,
				authorComment: undefined,
				location: undefined,
				pillar: undefined,
				topic: undefined};

			s.changePageSize = function(value) {
				s.pageSize = value;
				$scope.smartTableCtrl.pipe($scope.smartTableCtrl.tableState());
			};

			s.currentFilterBy = {}; // store the base query/filter, when it changes, go back to first page.

			s.callServer = function(tableState, ctrl) {

				if ($scope.smartTableCtrl !== ctrl) {
					$scope.smartTableCtrl = ctrl;
				}

				s.isLoading = true;

				var pagination = tableState.pagination;
				var sort = tableState.sort;

				var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
				var limit = pagination.number || s.pageSize;  // Number of entries showed per page.

				// set the primary query
				var filterBy = {period: s.period._id, eaoStatus: undefined, proponentStatus: undefined, isPublished: true};
				if (s.period.userCan.vetComments ) {
					filterBy = {period: s.period._id, eaoStatus: s.eaoStatus, proponentStatus: undefined, isPublished: undefined};
				}
				if (s.period.userCan.classifyComments && !s.period.userCan.vetComments) {
					if (s.proponentStatus === 'Classified') {
						filterBy = {period: s.period._id, eaoStatus: undefined, proponentStatus: 'Classified', isPublished: true};
					} else {
						filterBy = {period: s.period._id, eaoStatus: undefined, proponentStatus: 'Unclassified', isPublished: true};
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
					.then(function(p) {
						refreshFilterArrays(p);
						return CommentModel.getCommentsForPeriod(
							filterBy.period, filterBy.eaoStatus, filterBy.proponentStatus, filterBy.isPublished,
							filterByFields.commentId, filterByFields.authorComment, filterByFields.location, filterByFields.pillar, filterByFields.topic,
							start, limit, sort.predicate, sort.reverse);
					})
					.then(function(result) {
						_.each(result.data, function (item) {
							var publishedCount = function(item) {
								_.each(item.documents, function (doc) {
									if (doc.eaoStatus === 'Published') {
										publishedCount++;
									}
								});
							};
							item.publishedDocumentCount = period.userCan.vetComments ? item.documents.length : publishedCount(item);
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

			s.downloadCommentData = function () {
				var getBrowser = function() {

					var userAgent = window.navigator.userAgent;

					// Feature detection method
					if (Object.hasOwnProperty.call(window, "ActiveXObject") && !window.ActiveXObject) {
						// console.log("IE11");
						return 'ie';
					}
					if(navigator.appVersion.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident") !== -1 || navigator.appVersion.indexOf("Edge") !== -1){
						// console.log("IE Version < 11");
						return 'ie';
					}

					var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i};
					for(var key in browsers) {
						if (browsers[key].test(userAgent)) {
							return key;
						}
					}
				};
				// console.log("data:", s.tableParams.data);
				CommentPeriodModel.getForPublic(s.period._id)
					.then(function(p) {
						refreshFilterArrays(p);
						return CommentModel.getCommentsForPeriod(
							filterBy.period, filterBy.eaoStatus, filterBy.proponentStatus, filterBy.isPublished,
							filterByFields.commentId, filterByFields.authorComment, filterByFields.location, filterByFields.pillar, filterByFields.topic,
							0, s.total, 'commentId', true);
					})
					.then(function(result) {
						CommentModel.prepareCSV(result.data)
							.then( function (data) {
								var blob = new Blob([ data ], { type : 'octet/stream' });
								var filename = (s.eaoStatus) ? s.eaoStatus + ".csv" : 'tableData.csv';
								var browse = getBrowser();
								if (browse === 'firefox') {
									var ff = angular.element('<a/>');
									ff.css({display: 'none'});
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
									var safariBlob = new Blob([ data ], { type : 'text/csv;base64' });
									var safariUrl = window.webkitURL.createObjectURL( safariBlob );
									var safariAnchor = document.createElement("a");
									safariAnchor.href = safariUrl;
									safariAnchor.click();
									window.webkitURL.revokeObjectURL(safariUrl);
								} else {
									var url = (window.URL || window.webkitURL).createObjectURL( blob );
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
			s.detail = function (comment) {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/project-comments/client/views/public-comments/detail.html',
					controllerAs: 's',
					size: 'lg',
					windowClass: 'public-comment-modal',
					resolve: {
						docs: function() {
							return CommentModel.getDocuments(comment._id);
						}
					},
					controller: function ($scope, $modalInstance, docs) {
						var self = this;


						self.period      				= period;
						self.project     				= project;
						self.comment     				= angular.copy(comment);
						self.comment.documents 	= angular.copy(docs);

						self.canUpdate = (self.period.userCan.classifyComments || self.period.userCan.vetComments);
						self.rejectedReasons = ['', 'Unsuitable Language', 'Quoting Third Parties', 'Petitions', 'Personally Identifying Information'];

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


						self.cancel      = function () { $modalInstance.dismiss ('cancel'); };
						self.ok          = function () { $modalInstance.close (self.comment); };
						self.pillars     	= self.comment.pillars.map (function (e) { return e; });
						self.vcs 		   		= self.comment.valuedComponents.map (function (e) { return e.name; });
						
						self.statusChange = function(status) {
							self.comment.eaoStatus = status;
						};
						
						self.fileStatusChange = function(status, file) {
							// do not allow a change to Published if it is Rejected and comment is rejected
							if ('Published' === status && self.comment.eaoStatus === 'Rejected') {
								// don't allow this change...
							} else {
								file.eaoStatus = status;
							}
						};

						self.submitForm = function(isValid) {
							// check to make sure the form is completely valid
							if (isValid) {
								$modalInstance.close (self.comment);
							}
						};

					},
				})
				.result.then (function (data) {
					//console.log ('result:', data);
					data.proponentStatus = (data.pillars.length > 0) ? 'Classified' : 'Unclassified';
					Promise.resolve()
					.then(function() {
						return data.documents.reduce(function (current, value, index) {
								return CommentModel.updateDocument(value);
							}, Promise.resolve())	;
					})
					.then(function(result) {
						return CommentModel.save (data);
					})
					.then (function (result) {
						// TODO reload data
						$scope.smartTableCtrl.pipe($scope.smartTableCtrl.tableState());
					});
				})
				.catch (function (err) {});
			};
		}
	};
})
// -------------------------------------------------------------------------
//
// add a public comment
//
// -------------------------------------------------------------------------
.directive ('addPublicComment', function ($modal, CommentModel, Upload, $timeout, _, $state) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			period : '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function () {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/project-comments/client/views/public-comments/add.html',
					controllerAs: 's',
					backdrop: 'static',
					size: 'lg',
					windowClass: 'public-comment-modal',
					resolve: {
						comment: function (CommentModel) {
							return CommentModel.getNew ();
						}
					},
					controller: function ($rootScope, $scope, $modalInstance, comment) {
						// console.log("Adding a comment.");
						var s     = this;

						$scope.project = scope.project;

						var maxFileSize = 5 * 1024 * 1024; //5MB

						s.step    = 1;
						s.comment = comment;
						comment.period = scope.period;
						comment.project = scope.project;
						comment.files = scope.files;
						comment.makeVisible = false;
						s.fileList = [];
						s.showAlert = false;

						$scope.$watch('s.comment.files', function (newValue) {
							if (newValue) {
								s.showAlert = false;
								s.comment.inProgress = false;
								_.each( newValue, function(file, idx) {
									if (file.size > maxFileSize) {
										s.showAlert = true;
									} else {
										s.fileList.push(file);
									}
								});
							}
						});
						s.comment.removeFile = function(f) {
							_.remove(s.fileList, f);
						};

						s.closeAlert = function(){ s.showAlert = false; };

						s.cancel  = function () { $modalInstance.dismiss ('cancel'); };
						s.next    = function () { s.step++; };
						s.ok      = function () { $modalInstance.close (s.comment); };
						s.submit  = function () {
							// console.log("files:", s.fileList);
							s.comment.inProgress = false;
							comment.isAnonymous = !comment.makeVisible;
							var docCount = s.fileList.length;

							if (!comment.author) {
								comment.isAnonymous = true; // if the author is empty make it anonymous
							}

							if (docCount === 0 ) {
								// We don't need to do anything but add the comment.
								// console.log("s.comment:", s.comment);
								 CommentModel.add (s.comment)
								.then (function (comment) {
									s.step = 3;
									$scope.$apply ();
									$rootScope.$broadcast('NEW_PUBLIC_COMMENT_ADDED', {comment: comment});
									return null;
								})
								.catch (function (err) {
									s.step = 4;
									$scope.$apply ();
								});
							} else {
								var uploadedDocs = [];
								// Upload docs
								angular.forEach( s.fileList, function(file) {
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
												_.each( uploadedDocs, function(d) {
													s.comment.documents.push(d);
												});
		
												if (!s.comment.comment) {
													s.comment.comment = "Please see the Attachment"; //if the comment is empty and has attachment
												} 
												
												CommentModel.add (s.comment)
												.then (function (comment) {
													s.step = 3;
													$scope.$apply ();
													$rootScope.$broadcast('NEW_PUBLIC_COMMENT_ADDED', {comment: comment});
												})
												.catch (function (err) {
													s.step = 4;
													$scope.$apply ();
												});
											}
										});
									}, function (response) {
										if (response.status > 0) {
											// docUpload.errorMsg = response.status + ': ' + response.data;
											console.log("error data:",response.data);
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
				.result.then (function (data) {
					// Redirect to full PCP page
					$state.transitionTo('p.commentperiod.detail', {projectid: scope.project.code, periodId: data.period._id}, {
						reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {});
			});
		}
	};
})
// -------------------------------------------------------------------------
//
// add an open house thingamabob
//
// -------------------------------------------------------------------------
.directive ('editOpenHouse', function ($modal) {
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
					$modal.open ({
						animation: true,
						templateUrl: 'modules/project-comments/client/views/public-comments/open-house-edit.html',
						controllerAs: 's',
						size: 'md',
						windowClass: 'public-comment-modal',
						controller: function ($scope, $modalInstance) {
							var s     = this;
							s.period = scope.period;
							s.project = scope.project;
							s.openHouse = scope.openhouse;
							console.log ('openHouse = ', scope.openhouse);
							if (scope.mode === 'add') {
								s.openHouse = {
									eventDate   : new Date (),
									description : ''
								};
							}
							s.cancel  = function () { $modalInstance.dismiss ('cancel'); };
							s.ok      = function () {
								if (scope.mode === 'add') {
									scope.period.openHouses.push (s.openHouse);
								}
								$modalInstance.close ();
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
	}
])
;
//
// CC: pretty sure these are not used anymore
//
// // -------------------------------------------------------------------------
// //
// // Comment Period List for a given project
// //
// // -------------------------------------------------------------------------
// .directive ('tmplCommentPeriodList', function () {
// 	return {
// 		restrict: 'E',
// 		templateUrl: 'modules/project-comments/client/views/period-list.html',
// 		controller: 'controllerCommentPeriodList',
// 		controllerAs: 'plist'
// 	};
// })
// .directive ('editPeriodModal', ['$modal', function ($modal) {
// 	return {
// 		restrict: 'A',
// 		scope: {
// 			project: '=',
// 			period: '='
// 		},
// 		link : function (scope, element, attrs) {
// 			// console.log('my modal is running');
// 			element.on ('click', function () {
// 				var modalView = $modal.open ({
// 					animation: true,
// 					templateUrl: 'modules/project-comments/client/views/period-edit.html',
// 					controller: 'controllerEditPeriodModal',
// 					controllerAs: 'p',
// 					scope: scope,
// 					size: 'lg',
// 					resolve: {
// 						rProject: function() { return scope.project; },
// 						rPeriod: function() { return scope.period; }
// 					}
// 				});
// 				modalView.result.then(function () {}, function () {});
// 			});
// 		}

// 	};
// }]

