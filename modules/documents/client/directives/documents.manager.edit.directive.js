'use strict';
angular.module('documents')
	.directive('documentMgrEdit', ['$rootScope', '$modal', '$log', '_', 'moment', 'DocumentMgrService', 'TreeModel', 'CodeLists', function ($rootScope, $modal, $log, _, moment, DocumentMgrService, TreeModel, CodeLists) {
		return {
			restrict: 'A',
			scope: {
				project: '=',
				doc: '=',
				onUpdate: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						templateUrl: 'modules/documents/client/views/document-manager-edit.html',
						resolve: {
							obj: function(Document, FolderModel) {
								if (scope.doc._schemaName === "Document") {
									return Document.getModel(scope.doc._id);
								} else {
									return FolderModel.lookup(scope.project._id, scope.doc.model.id);
								}
							}
						},
						controllerAs: 'editFileProperties',
						controller: function ($scope, $modalInstance, DocumentMgrService, TreeModel, ProjectModel, Document, obj, CodeLists, FolderModel, AlertService) {
							var self = this;
							self.busy = true;

							$scope.project = scope.project;
							$scope.types = CodeLists.documentTypes.active;
							$scope.inspectionReportFollowupTypes = CodeLists.inspectionReportFollowUpTypes.active;

							$scope.dateOptions = {
								showWeeks: false
							};

							$scope.originalName = obj.displayName || obj.documentFileName || obj.internalOriginalName;
							$scope.doc = obj;
							// any dates going to the datepicker need to be javascript Date objects...
							$scope.doc.documentDate = _.isEmpty(obj.documentDate) ? null : moment(obj.documentDate).toDate();
							$scope.datePicker = {
								opened: false
							};
							$scope.dateOpen = function() {
								$scope.datePicker.opened = true;
							};
							$scope.doc.dateUploaded = _.isEmpty(obj.dateUploaded) ? moment.now() : moment(obj.dateUploaded).toDate();
							$scope.dateUploadedPicker = {
								opened: false
							};
							$scope.dateUploadedOpen = function() {
								$scope.dateUploadedPicker.opened = true;
							};

							$scope.$watch('doc.documentType',
								function (data) {
									if (data) {
										switch(data) {
											case 'Inspection Report':
												if (!$scope.doc.inspectionReport) {
													$scope.doc.inspectionReport = { inspectorInitials: null, followup: null };
												}
												break;
											case 'Certificate':
												if (!$scope.doc.certificate) {
													$scope.doc.certificate = {};
												}
												break;
											case 'Certificate Amendment':
												if (!$scope.doc.certificateAmendment) {
													$scope.doc.certificateAmendment = {};
												}
												break;
											default:
												break;
										}
									}
								}
							);

							$scope.validate = function() {
								$scope.$broadcast('show-errors-check-validity', 'editFileForm');
							};

							self.canEdit = $scope.doc.userCan.write;

							self.cancel = function () {
								$modalInstance.dismiss('cancel');
							};

							self.save = function (isValid) {
								self.busy = true;
								// should be valid here...
								if (isValid) {
									if ($scope.doc._schemaName === "Document") {
										Document.save($scope.doc)
										.then(function (result) {
											// somewhere here we need to tell document manager to refresh it's document...
											if (scope.onUpdate) {
												scope.onUpdate(result);
											}
											self.busy = false;
											$modalInstance.close(result);
										}, function(error) {
											console.log(error);
											self.busy = false;
										});
									} else {
										// Check if the foldername already exists.
										FolderModel.lookupForProjectIn($scope.project._id, $scope.doc.parentID)
										.then(function (fs) {
											if ($scope.originalName === $scope.doc.displayName) {
												// Skip if we detect the user didn't change the name.
												return FolderModel.save($scope.doc);
											} else {
												var found = null;
												_.each(fs, function (foldersInDirectory) {
													if (foldersInDirectory.displayName === $scope.doc.displayName) {
														found = true;
														return false;
													}
												});
												if (found) {
													return null;
												} else {
													return FolderModel.save($scope.doc);
												}
											}
										})
										.then(function (result) {
											if (result) {
												// somewhere here we need to tell document manager to refresh it's document...
												if (scope.onUpdate) {
													scope.onUpdate(result);
												}
												self.busy = false;
												$modalInstance.close(result);
											} else {
												self.busy = false;
												AlertService.error("Sorry, folder already exists.  Please choose another name.");
											}
										}, function(error) {
											console.log(error);
											self.busy = false;
										});
									}
								}
							};
							self.busy = false;
						}
					});
				});
			}
		};
	}])
;
