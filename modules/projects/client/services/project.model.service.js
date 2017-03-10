'use strict';
// =========================================================================
//
// this is the project data model (service). This is how all project data
// is accessed through the front end
//
// =========================================================================
angular.module('project').factory ('ProjectModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var ProjectClass = ModelBase.extend ({
		urlName : 'project',
		removeProject: function(project) {
			return this.delete ('/api/project/' + project._id + '/remove');
		},
		// -------------------------------------------------------------------------
		//
		// get a project by its code
		//
		// -------------------------------------------------------------------------
		byCode : function (code) {
			return this.get ('/api/project/bycode/'+code);
		},
		// -------------------------------------------------------------------------
		//
		// get just the code and name of the projects for a subset
		//
		// -------------------------------------------------------------------------
		lookupByEpicID : function (id) {
			return this.get ('/api/project/byEpicProjectID/'+id);
		},
		lookup : function () {
			return this.get ('/api/projects/lookup');
		},
		picklist : function() {
			return this.get ('/api/projects/picklist');
		},
		published: function () {
			return this.get ('/api/projects/published');
		},
		mine: function () {
			return this.get ('/api/projects/mine');
		},
		forProponent: function(id) {
			return this.get ('/api/projects/proponent/' + id);
		},
		getProjectDirectory: function (project) {
			return this.get ('/api/project/' + project._id + '/directory/list');
		},
		publishDirectory: function (project, directoryId) {
			return this.put ('/api/project/' + project._id + '/directory/publish/' + directoryId);
		},
		unpublishDirectory: function (project, directoryId) {
			return this.put ('/api/project/' + project._id + '/directory/unpublish/' + directoryId);
		},
		// -------------------------------------------------------------------------
		//
		// add a phase, form a base phase, to a project. All ancenstors get copied
		//
		// -------------------------------------------------------------------------
		addPhase: function (project, basePhaseId) {
			return this.put ('/api/project/' + project._id + '/add/phase/' + basePhaseId, {});
		},
		removePhase: function(project, phase) {
			return this.put ('/api/project/' + project._id + '/remove/phase/' + phase._id, {});
		},
		completePhase: function (project, phase) {
			return this.put ('/api/project/' + project._id + '/complete/phase/' + phase._id, {});
		},
		uncompletePhase: function (project, phase) {
			return this.put ('/api/project/' + project._id + '/uncomplete/phase/' + phase._id, {});
		},
		startNextPhase: function (project) {
			return this.put ('/api/project/' + project._id + '/start/next/phase', {});
		},
		publishProject: function (project) {
			return this.put ('/api/project/' + project._id + '/publish', {});
		},
		unpublishProject: function (project) {
			return this.put ('/api/project/' + project._id + '/unpublish', {});
		},
		submit: function (project) {
			return this.put ('/api/project/' + project._id + '/submit', {});
		},
		// -------------------------------------------------------------------------
		//
		// intake questions
		//
		// -------------------------------------------------------------------------
		getProjectIntakeQuestions: function () {
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
		}
	});
	return new ProjectClass ();
});





