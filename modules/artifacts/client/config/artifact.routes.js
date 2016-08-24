'use strict';
// =========================================================================
//
// artifact routes
//
// =========================================================================
angular.module('core').config(['$stateProvider','_', function ($stateProvider, _, Authentication) {

	var getPrevNextStage = function (stage, stages) {
		var index = _.findIndex (stages, function (s) { return s.name === stage;});
		// console.log (index);
		return {
			prev: (stages[index - 1]) ? stages[index - 1].name : '',
			next: (stages[index + 1]) ? stages[index + 1].name : '',
		};
	};
	var properMethod = function (stage) {
		if (stage === 'Edit') return 'edit';
		else if (stage === 'Review') return 'review';
		else if (stage === 'Approval') return 'approve';
		else if (stage === 'Executive Approval') return 'executive';
		else if (stage === 'Publishing') return 'publish';
		else if (stage === 'Notification') return 'notify';
		else if (stage === 'Comment Period') return 'comment';
		else if (stage === 'Public Comment Period') return 'public-comment';
		else if (stage === 'Decision') return 'decision';
	};



	$stateProvider
	// -------------------------------------------------------------------------
	//
	// the list state for artifacts and project are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('p.artifactlist', {
		url: '/artifactlist',
		templateUrl: 'modules/artifacts/client/views/artifact-list.html',
		controller: function ($scope, NgTableParams, artifacts, project) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: artifacts});
			$scope.project = project;
		}
	})
	.state('p.artifactcreate', {
		url: '/artifactcreate/:code',
		template: '<p></p>',
		controller: function ($scope, $state, project, $stateParams, ArtifactModel) {
			// console.log ('c code = ', $stateParams.code);
			// console.log ('project = ', project);
			ArtifactModel.newFromType ($stateParams.code, project._id)
			.then (function (a) {
				// console.log ('artifact = ', a);
				$state.go ('p.artifact.edit', {artifactId:a._id});
			});
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for artifacts.
	// since it is a child of p (project), the project injection has already
	// been resolved and is available to subsequent child states as 'project'
	// here we will resolve the artifact itself which will be available to all
	// child states
	//
	// -------------------------------------------------------------------------
	.state('p.artifact', {
		abstract:true,
		url: '/artifact/:artifactId',
		// template: '<ui-view "></ui-view>',
		templateUrl: 'modules/artifacts/client/views/artifact-container.html',
		resolve: {
			artifact: function ($stateParams, ArtifactModel) {
				// need to refresh the artifact on each transition...  do not count on this...
				return ArtifactModel.getModel ($stateParams.artifactId);
			},
			fix: function (artifact, ArtifactTypeModel) {
				if (!artifact.artifactType) {
					// console.log ('getting fix');
					return ArtifactTypeModel.fromCode (artifact.typeCode);
				}
				else return Promise.resolve (false);
			},
			fix2: function (artifact, TemplateModel) {
				if (!artifact.template) {
					// console.log ('getting fix2');
					return TemplateModel.fromCode (artifact.typeCode);
				}
				else return Promise.resolve (false);
			},
			apply: function (artifact, fix, fix2) {
				return new Promise (function (resolve, reject) {
					if (fix) {
						// console.log ('applying fix', fix);
						artifact.artifactType = fix;
					}
					if (fix2) {
						// console.log ('applying fix2', fix2);
						artifact.template = fix2;
					}
					resolve (true);
				});
			},
			rolePermissions: function($stateParams, ArtifactModel) {
				return ArtifactModel.checkPermissions($stateParams.artifactId);
			}
		},
		controller: function ($scope, rolePermissions) {
			$scope.rolePermissions = rolePermissions;
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('p.artifact.edit', {
		url: '/edit',
		templateUrl: 'modules/artifacts/client/views/artifact-edit.html',
		data: {
			// roles: ['*:eao:epd','*:eao:project-admin','*:eao:project-lead','*:eao:project-team']
		},
		resolve: {
			artifact: function ($stateParams, ArtifactModel) {
				// need to refresh the artifact on each transition...
				return ArtifactModel.getModel ($stateParams.artifactId);
			}
		},
		controller: function ($location, $scope, $state, artifact, fix, project, ArtifactModel, Document, MilestoneModel, UserModel, TemplateModel) {
			// console.log ('artifact = ', artifact);
			// console.log ('project  = ', project);
			// artifact.artifactType = fix;

			var method = properMethod (artifact.stage);
			if (method !== 'edit') $state.go ('p.artifact.'+method);
			$scope.buttons = getPrevNextStage (artifact.stage, artifact.artifactType.stages);
			$scope.artifact = artifact;
			$scope.project = project;
			$scope.artifact.document = ($scope.artifact.document) ? $scope.artifact.document : {};
			$scope.artifact.maindocument = $scope.artifact.document._id ? [$scope.artifact.document._id] : [];

			$scope.$watchCollection ('artifact.maindocument', function (newval) {
				if (!newval || newval.length === 0) return;
				//console.log ('nedw collection:', newval);
				Document.getDocument (newval[0]).then (function (ret) {
					$scope.artifact.document = ret;
					//console.log ('doc is now', $scope.artifact.document);
				});
			});
			if (_.isEmpty (artifact.templateData)) artifact.templateData = {};
			$scope.version = artifact.version;
			$scope.saveas = function () {
				artifact.document = artifact.maindocument[0];
				if (_.isEmpty (artifact.document)) artifact.document = null;
				ArtifactModel.getNew ().then (function (newartifact) {
					var a = ArtifactModel.getCopy ($scope.artifact);
					a._id = newartifact._id;
					// Make sure this isn't published.
					a.isPublished = false;
					a.read.splice(a.read.indexOf('public'), 1);
					a.version =  $scope.version;
					ArtifactModel.add (a).then (function (m) {
						// console.log ('new artifact was saved', m);
						$state.go ('p.artifact.view');
					})
					.catch (function (err) {
						console.error (err);
						// // alert (err.message);
					});
				});
			};
			$scope.save = function () {
				artifact.document = artifact.maindocument[0];
				if (_.isEmpty (artifact.document)) artifact.document = null;
				ArtifactModel.save ($scope.artifact)
				.then (function (model) {
					$state.go ('p.artifact.view');
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
			// Remove this artifact
			$scope.remove = function () {
				artifact.document = artifact.maindocument[0];
				if (_.isEmpty (artifact.document)) artifact.document = null;
				MilestoneModel.deleteMilestone($scope.artifact.milestone)
				.then( function () {
					ArtifactModel.remove ($scope.artifact)
					.then (function (model) {
						$state.go ('p.detail', {projectid:project.code});
					});
				})
				.catch (function (err) {
					console.error (err);
					// // alert (err.message);
				});
			};
			$scope.submit = function () {
				artifact.document = artifact.maindocument[0];
				if (_.isEmpty (artifact.document)) artifact.document = null;
				if($scope.artifact.signatureStage === 'Edit') {
					UserModel.me()
					.then(function (user) {
						if (user.signature) {
							$scope.artifact.templateData.sign.sig = "<img src='/api/document/"+user.signature+"/fetch'/>";
						}
						ArtifactModel.save($scope.artifact)
						.then (function (art) {
							// console.log("got art:", art);
							return ArtifactModel.nextStage (art);
						})
						.catch (function (err) {
							console.error (err);
							// alert (err.message);
						});
					})
					.then(function () {
						$state.go ('p.artifact.view');
					})
					.catch (function (err) {
						console.error(err);
					});
				} else {
					ArtifactModel.nextStage ($scope.artifact)
					.then (function (model) {
						$state.go ('p.artifact.view');
					})
					.catch (function (err) {
						console.error (err);
						// alert (err.message);
					});
				}
			};
			$scope.update = function () {
				artifact.document = artifact.maindocument[0];
				if (_.isEmpty (artifact.document)) artifact.document = null;
				ArtifactModel.save($scope.artifact)
				.then (function (art) {
					return ArtifactModel.publish (art._id);
				})
				.then (function (model) {
					$state.go ('p.artifact.view');
				});
			};
			$scope.$on('cleanup', function () {
				$state.go ('p.artifact.view', {
					projectid:project.code,
					artifact: $scope.artifact
				});
			});
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a artifact. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('p.artifact.view', {
		url: '/view',
		templateUrl: 'modules/artifacts/client/views/artifact-view.html',
		resolve: {
			artifact: function ($stateParams, ArtifactModel) {
				// need to refresh the artifact on each transition...
				return ArtifactModel.getModel ($stateParams.artifactId);
			}
		},
		controller: function ($scope, $state, artifact, fix, project, ArtifactModel, Authentication, VcModel) {
			$scope.authentication = Authentication;
			$scope.artifact = artifact;
			$scope.project = project;
		}
	})
	.state('p.artifact.comment', {
		url: '/comment',
		templateUrl: 'modules/artifacts/client/views/artifact-comment.html',
		resolve: {
			artifact: function ($stateParams, ArtifactModel) {
				// need to refresh the artifact on each transition...
				return ArtifactModel.getModel ($stateParams.artifactId);
			}
		},
		controller: function ($scope, $state, artifact, fix, project, ArtifactModel) {
			// artifact.artifactType = fix;
			$state.go ('p.artifact.view');
		}
	})
	.state('p.artifact.review', {
		url: '/review',
		templateUrl: 'modules/artifacts/client/views/artifact-review.html',
		resolve: {
			artifact: function ($stateParams, ArtifactModel) {
				// need to refresh the artifact on each transition...
				return ArtifactModel.getModel ($stateParams.artifactId);
			}
		},
		controller: function ($location, $scope, $state, artifact, fix, project, ArtifactModel, UserModel) {
			// artifact.artifactType = fix;
			// console.log ('artifact = ', artifact);
			var method = properMethod (artifact.stage);
			if (method !== 'review') $state.go ('p.artifact.'+method);
			$scope.artifact = artifact;
			$scope.project = project;
			$scope.buttons = getPrevNextStage (artifact.stage, artifact.artifactType.stages);
			$scope.reject = function () {
				ArtifactModel.prevStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.artifact.view');
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
			$scope.submit = function () {
				if($scope.artifact.signatureStage === 'Review') {
					UserModel.me()
					.then(function (user) {
						if (user.signature) {
							$scope.artifact.templateData.sign.sig = "<img src='/api/document/"+user.signature+"/fetch'/>";
						}
						ArtifactModel.save($scope.artifact)
						.then (function (art) {
							// console.log("got art:", art);
							return ArtifactModel.nextStage (art);
						})
						.catch (function (err) {
							console.error (err);
							// alert (err.message);
						});
					})
					.then(function () {
						$state.go ('p.artifact.view');
					})
					.catch (function (err) {
						console.error(err);
					});
				} else {
					ArtifactModel.nextStage ($scope.artifact)
					.then (function (model) {
						$state.go ('p.artifact.view');
					})
					.catch (function (err) {
						console.error (err);
						// alert (err.message);
					});
				}
			};
		}
	})
	.state('p.artifact.approve', {
		url: '/approve',
		templateUrl: 'modules/artifacts/client/views/artifact-approve.html',
		resolve: {
			artifact: function ($stateParams, ArtifactModel) {
				// need to refresh the artifact on each transition...
				return ArtifactModel.getModel ($stateParams.artifactId);
			}
		},
		controller: function ($location, $scope, $state, artifact, fix, project, ArtifactModel, UserModel, TemplateModel) {
			// artifact.artifactType = fix;
			var method = properMethod (artifact.stage);
			if (method !== 'review') $state.go ('p.artifact.'+method);
			$scope.artifact = artifact;
			$scope.project = project;
			$scope.buttons = getPrevNextStage (artifact.stage, artifact.artifactType.stages);
			$scope.reject = function () {
				ArtifactModel.prevStage ($scope.artifact)
				.then (function (model) {
				$state.go ('p.artifact.view');
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
			$scope.submit = function () {
				if($scope.artifact.signatureStage === 'Approve') {
					UserModel.me()
					.then(function (user) {
						if (user.signature) {
							$scope.artifact.templateData.sign.sig = "<img src='/api/document/"+user.signature+"/fetch'/>";
						}
						ArtifactModel.save($scope.artifact)
						.then (function (art) {
							// console.log("got art:", art);
							return ArtifactModel.nextStage (art);
						})
						.catch (function (err) {
							console.error (err);
							// alert (err.message);
						});
					})
					.then(function () {
						$state.go ('p.artifact.view');
					})
					.catch (function (err) {
						console.error(err);
					});
				} else {
					ArtifactModel.nextStage ($scope.artifact)
					.then (function (model) {
						$state.go ('p.artifact.view');
					})
					.catch (function (err) {
						console.error (err);
						// alert (err.message);
					});
				}
			};
		}
	})
	.state('p.artifact.executive', {
		url: '/executive',
		templateUrl: 'modules/artifacts/client/views/artifact-executive.html',
		resolve: {
			artifact: function ($stateParams, ArtifactModel) {
				// need to refresh the artifact on each transition...
				return ArtifactModel.getModel ($stateParams.artifactId);
			}
		},
		controller: function ($location, $scope, $state, artifact, fix, project, ArtifactModel, TemplateModel, UserModel) {
			// artifact.artifactType = fix;
			var method = properMethod (artifact.stage);
			if (method !== 'review') $state.go ('p.artifact.'+method);
			$scope.artifact = artifact;
			$scope.project = project;
			$scope.buttons = getPrevNextStage (artifact.stage, artifact.artifactType.stages);
			$scope.reject = function () {
				ArtifactModel.prevStage ($scope.artifact)
				.then (function (model) {
				$state.go ('p.artifact.view');
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
			$scope.submit = function () {
				if($scope.artifact.signatureStage === 'Executive') {
					UserModel.me()
					.then(function (user) {
						if (user.signature) {
							$scope.artifact.templateData.sign.sig = "<img src='/api/document/"+user.signature+"/fetch'/>";
						}
						ArtifactModel.save($scope.artifact)
						.then (function (art) {
							// console.log("got art:", art);
							return ArtifactModel.nextStage (art);
						})
						.catch (function (err) {
							console.error (err);
							// alert (err.message);
						});
					})
					.then(function () {
						$state.go ('p.artifact.view');
					})
					.catch (function (err) {
						console.error(err);
					});
				} else {
					ArtifactModel.nextStage ($scope.artifact)
					.then (function (model) {
						$state.go ('p.artifact.view');
					})
					.catch (function (err) {
						console.error (err);
						// alert (err.message);
					});
				}
			};
		}
	})
	.state('p.artifact.decision', {
		url: '/decision',
		templateUrl: 'modules/artifacts/client/views/artifact-decision.html',
		resolve: {
			artifact: function ($stateParams, ArtifactModel) {
				// need to refresh the artifact on each transition...
				return ArtifactModel.getModel ($stateParams.artifactId);
			}
		},
		controller: function ($location, $scope, $state, artifact, fix, project, ArtifactModel, TemplateModel, UserModel) {
			// artifact.artifactType = fix;
			// console.log ('artifact = ', artifact);
			var method = properMethod (artifact.stage);
			if (method !== 'decision') $state.go ('p.artifact.'+method);
			$scope.artifact = artifact;
			$scope.project = project;
			$scope.buttons = getPrevNextStage (artifact.stage, artifact.artifactType.stages);
			$scope.reject = function () {
				ArtifactModel.prevStage ($scope.artifact)
				.then (function (model) {
				$state.go ('p.artifact.view');
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
			$scope.submit = function () {
				if($scope.artifact.signatureStage === 'Decision') {
					UserModel.me()
					.then(function (user) {
						if (user.signature) {
							$scope.artifact.templateData.sign.sig = "<img src='/api/document/"+user.signature+"/fetch'/>";
						}
						ArtifactModel.save($scope.artifact)
						.then (function (art) {
							// console.log("got art:", art);
							return ArtifactModel.nextStage (art);
						})
						.catch (function (err) {
							console.error (err);
							// alert (err.message);
						});
					})
					.then(function () {
						$state.go ('p.artifact.view');
					})
					.catch (function (err) {
						console.error(err);
					});
				} else {
					ArtifactModel.nextStage ($scope.artifact)
					.then (function (model) {
						$state.go ('p.artifact.view');
					})
					.catch (function (err) {
						console.error (err);
						// alert (err.message);
					});
				}
			};
			$scope.info = function () {
				ArtifactModel.prevStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.artifact.view');
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
		}
	})
	.state('p.artifact.publish', {
		url: '/publish',
		templateUrl: 'modules/artifacts/client/views/artifact-publish.html',
		resolve: {
			artifact: function ($stateParams, ArtifactModel) {
				// need to refresh the artifact on each transition...
				return ArtifactModel.getModel ($stateParams.artifactId);
			}
		},
		controller: function ($scope, $state, artifact, fix, project, ArtifactModel, Document) {
			// artifact.artifactType = fix;
			// console.log ('artifact = ', artifact);
			var method = properMethod (artifact.stage);
			if (method !== 'review') $state.go ('p.artifact.'+method);
			$scope.artifact = artifact;
			$scope.project = project;
			$scope.buttons = getPrevNextStage (artifact.stage, artifact.artifactType.stages);
			$scope.reject = function () {
				ArtifactModel.prevStage ($scope.artifact)
				.then (function (model) {
					$state.go ('p.artifact.view');
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
			$scope.reset = function () {
				$scope.artifact.stage = "Edit";
				ArtifactModel.save($scope.artifact)
				.then (function (res) {
					$scope.artifact = res;
					$state.go ('p.artifact.view'); 
				});
			};
			$scope.submit = function () {
				console.log("publishing artifact and supporting documents:", $scope.artifact.document);
				//Document.publish($scope.artifact.additionalDocuments[0]);
				ArtifactModel.publish ($scope.artifact._id)
				// Don't progress to notify - this is handled somewhere else.
				// .then (function (res) {
				// 	$scope.artifact = res;
				// 	return ArtifactModel.nextStage (res);
				// })
				.then (function (model) {
					$state.go ('p.artifact.view');
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
		}
	})
	// .state('p.artifact.notify', {
	// 	url: '/notify',
	// 	templateUrl: 'modules/artifacts/client/views/artifact-notify.html',
	// 	resolve: {
	// 		artifact: function ($stateParams, ArtifactModel) {
	// 			// need to refresh the artifact on each transition...
	// 			return ArtifactModel.getModel ($stateParams.artifactId);
	// 		}
	// 	},
	// 	controller: function ($scope, $state, artifact, fix, project, ArtifactModel, EmailTemplateModel, _) {
	// 		// artifact.artifactType = fix;
	// 		// console.log ('artifact = ', artifact);
	// 		var method = properMethod (artifact.stage);
	// 		if (method !== 'review') $state.go ('p.artifact.'+method);
	// 		$scope.artifact = artifact;
	// 		$scope.project = project;
	// 		$scope.buttons = getPrevNextStage (artifact.stage, artifact.artifactType.stages);
	// 		$scope.reject = function () {
	// 			ArtifactModel.prevStage ($scope.artifact)
	// 			.then (function (model) {
	// 				$state.go ('p.artifact.view');
	// 			})
	// 			.catch (function (err) {
	// 				console.error (err);
	// 				// alert (err.message);
	// 			});
	// 		};
	// 		$scope.submit = function () {
	// 			ArtifactModel.nextStage ($scope.artifact)
	// 			.then (function (model) {
	// 				$state.go ('p.artifact.view');
	// 			})
	// 			.catch (function (err) {
	// 				console.error (err);
	// 				// alert (err.message);
	// 			});
	// 		};
	// 		//
	// 		// notification specific functions
	// 		//
	// 		EmailTemplateModel.getCollection().then( function(data) {
	//  			$scope.emailTemplates = data;
	// 		});

	// 		var separateRecipients = function(newRecipients) {
	// 			$scope.recipients = {adhoc: {viaEmail: [], viaMail: []}, mailOut: [] };
	// 			_.each(newRecipients, function(member) {
	// 				if (member.viaEmail) {
	// 					$scope.recipients.adhoc.viaEmail.push(member);
	// 				}
	// 				if (member.viaMail) {
	// 					$scope.recipients.adhoc.viaMail.push(member);
	// 					if (!_.include($scope.recipients.mailOut, member)) {
	// 						$scope.recipients.mailOut.push(member);
	// 					}
	// 				}
	// 			});
	// 		};

	// 		$scope.setContent = function() {
	// 			$scope.mailContent = $scope.selectedTemplate.content;
	// 		};

	// 		$scope.recipients = {adhoc: {viaEmail: [], viaMail: []}, mailOut: [] };

	// 		//
	// 		// Add Recipients
	// 		$scope.addRecipients = function(data, parent) {
	// 			$scope.customRecipients = data;
	// 			separateRecipients(data);
	// 		};


	// 	}
	// })

	;

}]);

