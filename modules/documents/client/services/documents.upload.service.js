'use strict';

angular.module('documents')
	.service('DocumentsUploadService', ['$rootScope', '$timeout', '$log', 'Upload', '_', 'Authentication', 'DocumentMgrService', 'Document', function ($rootScope, $timeout, $log, Upload, _, Authentication, DocumentMgrService, Document) {

		var inProgressFiles = [];


		var initialize = function(service) {
			if (service.actions.busy) {
				return;
			}
			inProgressFiles = [];
			service.actions.busy = false;
			service.actions.started = false;
			service.actions.completed = false;
			service.counts.uploading = 0;
			service.counts.uploaded = 0;
			service.counts.failed = 0;
			service.counts.cancelled = 0;
			service.counts.total = _.size(service.fileList);
			setAllowedActions(service);
		};

		var checkInProgressStatus = function(service) {
			if (service.actions.busy) {
				service.counts.uploading = _.filter(inProgressFiles, function(f) { return f.uploading; }).length;
				service.counts.uploaded = _.filter(inProgressFiles, function(f) { return f.uploaded; }).length;
				service.counts.failed = _.filter(inProgressFiles, function(f) { return f.failed; }).length;
				service.counts.cancelled = _.filter(inProgressFiles, function(f) { return f.cancelled; }).length;
				if (service.counts.uploading === 0){
					service.actions.busy = false;
					service.actions.started = false;
					service.actions.completed = true;
					setAllowedActions(service);
				}
			} else {
				setAllowedActions(service);
			}
		};

		var setAllowedActions = function(service) {
			service.actions.allowStart = (service.counts.total > 0 && !service.actions.busy && !service.actions.started) && (service.counts.uploading === 0, service.counts.failed === 0 && service.counts.cancelled === 0 && service.counts.uploaded === 0); // can't upload until last batch cleared...
			service.actions.allowStop = (service.counts.total > 0 && service.actions.busy && service.actions.started);
			service.actions.allowReset = (service.counts.total > 0 && !service.actions.busy && !service.actions.started); // clear ok when not uploading and we have files to remove
		};

		var addSingleFile = function(service, f) {
			if (service.actions.busy) {
				return false;
			}
			var found = _.find(service.fileList, function(o) {
				return o.name.toLowerCase() === f.name.toLowerCase() && o.lastModified === f.lastModified && o.size === f.size && o.type.toLowerCase() === f.type.toLowerCase();
			});
			if (!found) {
				//$log.debug('File not found with name = ', f.name);
				//$log.debug('  and lastModified = ', f.lastModified);
				//$log.debug('  and lastModifiedDate = ', f.lastModifiedDate);
				//$log.debug('  and size = ', f.size);
				//$log.debug('  and type = ', f.type);
				service.fileList.push(f);
				return true;
			} else {
				$log.debug('File already exists in list with name = ', f.name);
				$log.debug('  and lastModified = ', f.lastModified);
				$log.debug('  and lastModifiedDate = ', f.lastModifiedDate);
				$log.debug('  and size = ', f.size);
				$log.debug('  and type = ', f.type);
				return false;
			}

		};

		this.fileList = [];
		this.actions = {
			busy: false,
			started: false,
			completed: false,
			allowStart: false,
			allowStop: false,
			allowReset: false
		};
		this.counts = {
			uploading: 0,
			uploaded: 0,
			failed: 0,
			cancelled: 0,
			total: 0
		};

		this.addFile = function(f) {
			if (this.actions.busy) {
				return;
			}
			if (addSingleFile(this, f)) {
				initialize(this);
			}
		};

		this.addFiles = function(list) {
			if (this.actions.busy) {
				return;
			}
			var fileAdded = false;
			_.each(list, function(f) {
				if (addSingleFile(this, f)) {
					fileAdded = true;
				}
			});
			if (fileAdded) {
				initialize(this);
			}
		};

		this.removeFile = function(f) {
			if (this.actions.busy) {
				return;
			}
			var found = _.find(this.fileList, function(o) {
				return o.name.toLowerCase() === f.name.toLowerCase() && o.lastModified === f.lastModified && o.size === f.size && o.type.toLowerCase() === f.type.toLowerCase();
			});
			if (found) {
				_.remove(this.fileList, found);
				initialize(this);
			}
		};

		this.reset = function() {
			if (this.actions.busy) {
				return;
			}
			if ( _.size(this.fileList) > 0) {
				this.fileList = [];
				initialize(this);
			}
		};


		this.startUploads = function(targetUrl, directoryID, reviewdocs, dateUploaded) {
			var self = this;
			if (self.actions.busy) {
				return;
			}
			initialize(self);
			if (self.fileList && self.fileList.length && targetUrl) {
				self.actions.busy = true;
				self.actions.started = true;
				self.actions.completed = false;
				setAllowedActions(self);
				angular.forEach(self.fileList, function(file) {

					file.uploading = true;
					file.uploaded = false;
					file.cancelled = false;
					file.failed = false;

					/*
					 body...

					 projectfolderauthor,
					 documentauthor,
					 documentfilename,
					 documentfileurl,
					 documentfilesize,
					 documentfileformat,
					 documentisinreview,
					 directoryid

					 */
					var data = {
						documenttype: "Not Specified",
						documentsubtype: "Not Specified",
						documentfoldername:"Not Specified",
						documentisinreview: reviewdocs,
						documentauthor: Authentication.user.displayName,
						documentfilename: file.name,
						displayname: file.name,
						directoryid : directoryID
					};

					if (dateUploaded) {
						data.dateuploaded = dateUploaded;
					}

					file.status = undefined;
					file.upload = Upload.upload({
						url: targetUrl,
						file: file,
						data: data
					});

					$log.debug('Add to inProgressFiles: ', file.$$hashKey.toString());
					inProgressFiles.push(file);

					file.upload.then(function (response) {
						$timeout(function () {
							file.result = response.data;
							file.progress = 100;
							file.status = 'Completed';
							file.uploaded = true;
							file.uploading = false;
							checkInProgressStatus(self);
						});
					}, function (response) {
						if (response.status > 0) {
							$log.error('Upload file error. Name=' + file.name + ', Response Status=' + response.status + ', Response Data.Message=' + response.data.message);
							//self.errorMsg = response.status + ': ' + response.data;
							file.status = 'Failed';
							file.failed = true;
							file.uploading = false;
						} else {
							// abort was called...
							$log.debug('cancelled ' + file.$$hashKey.toString());
							file.status = 'Cancelled';
							file.cancelled = true;
							file.uploading = false;
						}
						checkInProgressStatus(self);
					}, function (evt) {
						// if we get a cancel request, then call
						file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
						file.status = 'In Progress';
						file.uploading = true;
					});
				});

			} else {
				checkInProgressStatus(self);
			}
		};

		this.cancelUpload = function(file) {
			if (Upload.isUploadInProgress() && file && file.status === 'In Progress') {
				//$log.debug('Uploading in progress, upload cancel requested for file: ', file.$$hashKey.toString());
				file.upload.abort();
			}
			setAllowedActions(this);
		};

		this.stopUploads = function() {
			if (Upload.isUploadInProgress()) {
				//$log.debug('Uploading in progress, but cancel all requested...');
				_.each(inProgressFiles, function(file) {
					this.cancelUpload(file);
				});
			} else {
				setAllowedActions(this);
			}
		};

}]);