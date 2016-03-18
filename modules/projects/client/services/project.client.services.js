'use strict';

angular.module('project')
	.service('Project', serviceProject);
// -----------------------------------------------------------------------------------
//
// SERVICE: Public Projects Main
//
// -----------------------------------------------------------------------------------
serviceProject.$inject = ['$http'];
/* @ngInject */
function serviceProject($http) {
	
	var getNewProject = function(req) {
		return $http({method:'GET',url: '/api/new/project/'});
	};

	var getProject = function(req) {
		return $http({method:'GET',url: '/api/project/' + req.id});
	};

	var addProject = function(req) {
		return $http({method:'POST',url: '/api/project', data: req});
	};

	var saveProject = function(req) {
		return $http({method:'PUT',url: '/api/project/' + req._id, data: req});
	};


	var setProjectStream = function(projectId, streamId) {
		return $http({method:'PUT',url: '/api/project/' + projectId + '/set/stream/' + streamId});
	};

	var getProjectIntakeQuestions = function() {
		return [
			{
				"code":"meetsrprcriteria",
				"content":"This project meets the criteria set out in the Reviewable Projects Regulation.",
				"type":"dropdown",
				"options":["Yes", "No"]
			},
			{
				"code":"section7optin",
				"content":"This project does not require an environmental assessment but is seeking designation under Section 7 of the Environmental Assessment Act.",
				"type":"dropdown",
				"options":["Yes", "No"]
			},
			{
				"code":"meetsCEAACriteria",
				"content":"This project is reviewable under the Canadian Environmental Assessment Act.",
				"type":"dropdown",
				"options":["Yes", "No", "Unsure"]
			},
			{
				"code":"contactedCEAA",
				"content":"The Canadian Environmental Assessment Agency has been contacted about this project.",
				"type":"dropdown",
				"options":["Yes", "No"]
			},
			{
				"code":"affectedFirstNations",
				"content":"List the First Nations whose aboriginal or treaty rights could be affected by the project.",
				"type":"text"
			},
			{
				"code":"contactedFirstNations",
				"content":"List the First Nations who have been contacted or consulted on the project.",
				"type":"text"
			},
			{
				"code":"lifespan",
				"content":"Expected life of the project (years)",
				"type":"smalltext"
			},
			{
				"code":"investment",
				"content":"Investment Amount (Canadian dollars)",
				"type":"smalltext"
			},
			{
				"code":"constructionjobs",
				"content":"Construction Jobs (Person years)",
				"type":"smalltext"
			},
			{
				"code":"operatingjobs",
				"content":"Operating Jobs (Person years)",
				"type":"smalltext"
			}	
		];
	};

	var updateMilestone = function(req) {
		return $http({method:'PUT',url: '/api/milestone/' + req._id, data: req});
	};


	// Add elements to projects

	var addBucketToProject = function(projectId, bucketId) {
		return $http({method:'PUT',url: '/api/project/' + projectId + '/add/bucket/' + bucketId});
	};

	var addPhaseToProject = function(projectId, phaseId) {
		return $http({method:'PUT',url: '/api/project/' + projectId + '/add/phase/' + phaseId});
	};

	var addMilestoneToPhase = function(phaseId, milestoneId) {
		return $http({method:'PUT',url: '/api/project/phase/' + phaseId + '/add/milestone/' + milestoneId});
	};

	var addActivityToPhase = function(phaseId, activityId) {
		return $http({method:'PUT',url: '/api/project/phase/' + phaseId + '/add/activity/' + activityId});
	};

	var addTaskToActivity = function(activityId, taskId) {
		return $http({method:'PUT',url: '/api/project/activity/' + activityId + '/add/task/' + taskId});
	};

	var addRequirementToTask = function(taskId, requirementId) {
		return $http({method:'PUT',url: '/api/project/task/' + taskId + '/add/requirement/' + requirementId});
	};

	var addRequirementToMilestone = function(milestoneId, requirementId) {
		return $http({method:'PUT',url: '/api/project/milestone/' + milestoneId + '/add/project/requirement/' + requirementId});
	};

	var addRequirementToBucket = function(bucketId, requirementId) {
		return $http({method:'PUT',url: '/api/project/bucket/' + bucketId + '/add/project/requirement/' + requirementId});
	};


	// get comment blank with defaults
	var getNewPublicComment = function() {
		return $http({method:'GET',url: '/api/new/publiccomment'});
	};

	// post new comment
	var addPublicComment = function(req) {
		return $http({method:'POST',url: '/api/publiccomment', data: req});
	};

	
	var getPublicCommentsPublished = function(projectId) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/published'});
	};

	var getPublicCommentsUnpublished = function(projectId) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/unpublished'});
	};

	var getPublicCommentsUnpublishedLimit = function(projectId, limit, offset) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/unpublished/limit/' + limit + '/offset/' + offset});
	};


	var updatePublicCommentEAOPublish = function(req) {
		return $http({method:'PUT',url: '/api/publiccomment/' + req._id + '/eao/publish'});
	};

	var updatePublicCommentEAODefer = function(req) {
		return $http({method:'PUT',url: '/api/publiccomment/' + req._id + '/eao/defer'});
	};

	var updatePublicCommentEAOReject = function(req) {
		return $http({method:'PUT',url: '/api/publiccomment/' + req._id + '/eao/reject'});
	};



	var updatePublicCommentDocumentEAOPublish = function(req) {
		return $http({method:'PUT',url: '/api/publiccommentdocument/' + req._id + '/eao/publish'});
	};

	var updatePublicCommentDocumentEAODefer = function(req) {
		return $http({method:'PUT',url: '/api/publiccommentdocument/' + req._id + '/eao/defer'});
	};

	var updatePublicCommentDocumentEAOReject = function(req) {
		return $http({method:'PUT',url: '/api/publiccommentdocument/' + req._id + '/eao/reject'});
	};






	var getPublicCommentVettingStart = function(req) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + req._id + '/vett/start'});
	};

	var getPublicCommentVettingClaim = function(req) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + req._id + '/vett/claim'});
	};

	var getPublicCommentClassifyStart = function(req) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + req._id + '/classify/start'});
	};
	
	var getPublicCommentClassifyClaim = function(req) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + req._id + '/classify/claim'});
	};

	var getNameAndCodeByID = function(req) {
		return $http({method:'GET',url: '/api/project/byid/'});
	};

	return {
		getNewProject: getNewProject,
		getProject: getProject,
		addProject: addProject,
		saveProject: saveProject,
		setProjectStream: setProjectStream,
		getProjectIntakeQuestions: getProjectIntakeQuestions,
		updateMilestone: updateMilestone,
		addBucketToProject: addBucketToProject,
		addPhaseToProject: addPhaseToProject,
		addMilestoneToPhase: addMilestoneToPhase,
		addActivityToPhase: addActivityToPhase,
		addTaskToActivity: addTaskToActivity,
		addRequirementToTask: addRequirementToTask,
		addRequirementToMilestone: addRequirementToMilestone,
		addRequirementToBucket: addRequirementToBucket,

		getNewPublicComment: getNewPublicComment,
		addPublicComment: addPublicComment,
		getPublicCommentsPublished: getPublicCommentsPublished,
		getPublicCommentsUnpublished: getPublicCommentsUnpublished,
		getPublicCommentsUnpublishedLimit: getPublicCommentsUnpublishedLimit,

		updatePublicCommentEAOPublish: updatePublicCommentEAOPublish,
		updatePublicCommentEAODefer: updatePublicCommentEAODefer,
		updatePublicCommentEAOReject: updatePublicCommentEAOReject,

		updatePublicCommentDocumentEAOPublish: updatePublicCommentDocumentEAOPublish,
		updatePublicCommentDocumentEAODefer: updatePublicCommentDocumentEAODefer,
		updatePublicCommentDocumentEAOReject: updatePublicCommentDocumentEAOReject,

		getPublicCommentVettingStart: getPublicCommentVettingStart,
		getPublicCommentVettingClaim: getPublicCommentVettingClaim,
		getPublicCommentClassifyStart: getPublicCommentClassifyStart,
		getPublicCommentClassifyClaim: getPublicCommentClassifyClaim,
		getNameAndCodeByID: getNameAndCodeByID

	};
}
