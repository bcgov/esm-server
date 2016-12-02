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
		controller: function ($rootScope, $scope, $filter, NgTableParams, Authentication, CommentModel, UserModel, _) {
			var s       = this;
			var project = s.project = $scope.project;
			var period  = s.period  = $scope.period;

			var currentFilter;
			s.topicsArray = [];
			s.pillarsArray = [];
			s.showTopicCloud = false;

			var refreshFilterArrays = function(data) {

				var allTopics = [];
				var allPillars = [];

				var topicList = [];
				var pillarList = [];

				_.forEach(data, function(item) {
					allTopics = allTopics.concat(item.topics);
					allPillars = allPillars.concat(item.pillars);
				});

				_.forEach(_.uniq(allTopics), function(item) {
					var o = {id: item, title: item};
					if (!_.includes(topicList, o))
						topicList.push(o);
				});
				// jsherman - 20160804: need an empty one for chrome, so we can de-select the filter...
				// adds a bogus one to safari and IE though:( so put at the bottom.
				topicList.push({id: '', title: ''});
				angular.copy(topicList, s.topicsArray);

				_.forEach(_.uniq(allPillars), function(item) {
					var o = {id: item, title: item};
					if (!_.includes(pillarList, o))
						pillarList.push(o);
				});
				// as above...
				pillarList.push({id: '', title: ''});
				angular.copy(pillarList, s.pillarsArray);

				var topicCloud = [];
				//  Grab the topics and insert them into the tag cloud.
				_.each(allTopics, function (topic) {
					// console.log("checking for topic:", topic);
					var index = _.indexOf(_.pluck(topicCloud, 'name'), topic);
					var count = 1;
					if (index !== -1) {
						count = topicCloud[index].size +1;
						_.remove(topicCloud, {
							name: topic
						});
					}
					// Add the new value in.
					topicCloud.push( {name: topic, size: count});
				});
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
					s.refreshEao ();
				}
			});

			// -------------------------------------------------------------------------
			//
			// these toggle things (the tab groups and filters)
			//
			// -------------------------------------------------------------------------
			s.toggle = function (v) {
				currentFilter = {eaoStatus:v};
				if (v === 'Classified' || v === 'Unclassified') currentFilter = {proponentFilter: (v === 'Unclassified' ? 0 : 1)};
				angular.extend(s.tableParams.filter(), currentFilter);
			};
			s.toggleP = function (v) {
				var filter = v === 'Unclassified' ? 0 : 1;
				currentFilter = {proponentFilter: filter};
				angular.extend(s.tableParams.filter(), currentFilter);
			};
			// -------------------------------------------------------------------------
			//
			// refresh eao data, this is pretty much everything
			//
			// -------------------------------------------------------------------------
			s.refreshEao = function () {
				CommentModel.getEAOCommentsForPeriod ($scope.period._id).then (function (result) {
					_.each(result.data, function (item) {
						item.authorAndComment = item.isAnonymous ? item.comment : item.author + ' ' + item.comment;
						item.publishedDocumentCount = item.documents.length;
					});

					s.totalPending  = result.totalPending;
					s.totalDeferred = result.totalDeferred;
					s.totalPublic   = result.totalPublic;
					s.totalRejected = result.totalRejected;
					s.totalAssigned   = result.totalAssigned;
					s.totalUnassigned = result.totalUnassigned;

					s.tableParams   = new NgTableParams (
						{	count:10,
							filter:currentFilter,
							sorting: {dateAdded: 'desc'}},
						{
							debugMode: false,
							total: result.data.length,
							getData: function($defer, params) {
								var orderedData = params.sorting() ? $filter('orderBy')(result.data, params.orderBy()) : result.data;

								var authorCommentFilterValue = params.filter()['authorCommentFilter'];
								params.filter()['authorCommentFilter'] = undefined; // ok, we need to remove the authorComment filter value, so that the default filtering will work...
								orderedData	= $filter('filter')(orderedData, params.filter());
								if (authorCommentFilterValue) {
									// now we apply the authorComment filter...
									orderedData	= $filter('authorCommentFilter')(orderedData, authorCommentFilterValue);
								}
								params.total(orderedData.length);
								$scope.filteredCount = orderedData.length;
								params.filter()['authorCommentFilter'] = authorCommentFilterValue; // put the value back in place...
								$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
							}
						});
					s.dataset = result.data;
					refreshFilterArrays(result.data);
					$scope.$apply ();
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
				CommentModel.prepareCSV(s.dataset)
				.then( function (data) {
					var blob = new Blob([ data ], { type : 'octet/stream' });
					var filename = (currentFilter) ? currentFilter.eaoStatus + ".csv" : 'tableData.csv';
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
			};
			// -------------------------------------------------------------------------
			//
			// refresh only public data
			//
			// -------------------------------------------------------------------------
			s.refreshPublic = function () {
				CommentModel.getPublishedCommentsForPeriod ($scope.period._id)
				.then (function (collection) {
					_.each(collection, function (item) {
						var publishedCount = 0;
						_.each(item.documents, function (doc) {
							if (doc.eaoStatus === 'Published') {
								publishedCount++;
							}
						});
						item.publishedDocumentCount = publishedCount;
						item.authorAndComment = item.isAnonymous ? item.comment : item.author + ' ' + item.comment;
					});
					s.tableParams   = new NgTableParams (
						{	count:50,
							sorting: {dateAdded: 'desc'}},
						{
							debugMode: false,
							total: collection.length,
							getData: function($defer, params) {
								var orderedData = params.sorting() ? $filter('orderBy')(collection, params.orderBy()) : collection;
								var authorCommentFilterValue = params.filter()['authorCommentFilter'];
								params.filter()['authorCommentFilter'] = undefined; // ok, we need to remove the authorComment filter value, so that the default filtering will work...
								orderedData	= $filter('filter')(orderedData, params.filter());
								if (authorCommentFilterValue) {
									// now we apply the authorComment filter...
									orderedData	= $filter('authorCommentFilter')(orderedData, authorCommentFilterValue);
								}
								params.total(orderedData.length);
								$scope.filteredCount = orderedData.length;
								params.filter()['authorCommentFilter'] = authorCommentFilterValue; // put the value back in place...
								$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
							}
						});
					s.dataset = collection;
					refreshFilterArrays(collection);
					$scope.$apply ();
				});
			};
			// -------------------------------------------------------------------------
			//
			// refresh only classification data
			//
			// -------------------------------------------------------------------------
			s.refreshProponent = function () {
				CommentModel.getProponentCommentsForPeriod ($scope.period._id).then (function (result) {
					_.each(result.data, function (item) {
						var publishedCount = 0;
						_.each(item.documents, function (doc) {
							if (doc.eaoStatus === 'Published') {
								publishedCount++;
							}
						});
						item.publishedDocumentCount = publishedCount;
						item.authorAndComment = item.isAnonymous ? item.comment : item.author + ' ' + item.comment;
					});
					// filters find classified in unclassified by default, just create a numeric field for filtering...
					_.forEach(result.data, function(o) { o.proponentFilter = o.proponentStatus === 'Unclassified' ? 0 : 1; });
					s.totalAssigned   = result.totalAssigned;
					s.totalUnassigned = result.totalUnassigned;
					s.tableParams   = new NgTableParams (
						{	count:50,
							sorting: {dateAdded: 'desc'}},
						{
							debugMode: false,
							total: result.data.length,
							getData: function($defer, params) {
								var orderedData = params.sorting() ? $filter('orderBy')(result.data, params.orderBy()) : result.data;
								var authorCommentFilterValue = params.filter()['authorCommentFilter'];
								params.filter()['authorCommentFilter'] = undefined; // ok, we need to remove the authorComment filter value, so that the default filtering will work...
								orderedData	= $filter('filter')(orderedData, params.filter());
								if (authorCommentFilterValue) {
									// now we apply the authorComment filter...
									orderedData	= $filter('authorCommentFilter')(orderedData, authorCommentFilterValue);
								}
								params.total(orderedData.length);
								$scope.filteredCount = orderedData.length;
								params.filter()['authorCommentFilter'] = authorCommentFilterValue; // put the value back in place...
								$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
							}
						});
					s.dataset = result.data;
					refreshFilterArrays(result.data);
					$scope.$apply ();
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
						if (period.userCan.vetComments) {
							s.refreshEao ();
						}
						else if (period.userCan.classifyComments) {
							s.refreshProponent ();
						}
					});
				})
				.catch (function (err) {});
			};
			if (period.userCan.vetComments) {
				currentFilter = {eaoStatus:'Unvetted'};
				s.refreshEao ();
			}
			else if (period.userCan.classifyComments) {
				currentFilter = {proponentFilter: 0}; //Unclassified
				s.refreshProponent ();
			}
			else {
				s.refreshPublic ();
			}
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
						s.step    = 1;
						s.comment = comment;
						comment.period = scope.period;
						comment.project = scope.project;
						comment.files = scope.files;
						comment.makeVisible = false;
						s.fileList = [];
						$scope.$watch('s.comment.files', function (newValue) {
							if (newValue) {
								s.filesRemoved = false;
								s.comment.inProgress = false;
								_.each( newValue, function(file, idx) {
									if (file.type === 'application/pdf') {
										s.fileList.push(file);
									} else {
										s.filesRemoved = true;
									}
								});
							}
						});
						s.comment.removeFile = function(f) {
							_.remove(s.fileList, f);
						};
						s.cancel  = function () { $modalInstance.dismiss ('cancel'); };
						s.next    = function () { s.step++; };
						s.ok      = function () { $modalInstance.close (s.comment); };
						s.submit  = function () {
							// console.log("files:", s.fileList);
							s.comment.inProgress = false;
							comment.isAnonymous = !comment.makeVisible;
							var docCount = s.fileList.length;

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

