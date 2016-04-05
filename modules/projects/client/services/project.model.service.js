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
		lookup : function () {
			return this.get ('/api/projects/lookup');
		},
		published: function () {
			return this.get ('/api/projects/published');
		},
		mine: function () {
			return this.get ('/api/projects/mine');
		},
		// -------------------------------------------------------------------------
		//
		// set a stream into a project, this copies over ALL base objects and makes
		// then real
		//
		// -------------------------------------------------------------------------
		setStream : function (streamId) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.put ('/api/project/'+self.model._id+'/set/stream/'+streamId, {})
				.then (function (res) {
					self.model = res;
					self.modelIsNew = false;
					resolve (res);
				}).catch (reject);
			});
		},
		// -------------------------------------------------------------------------
		//
		// add a phase, form a base phase, to a project. All ancenstors get copied
		//
		// -------------------------------------------------------------------------
		addPhase : function (basePhaseId) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.put ('/api/project/'+self.model._id+'/add/phase/'+basePhaseId, {})
				.then (function (res) {
					self.model = res;
					self.modelIsNew = false;
					resolve (res);
				}).catch (reject);
			});
		},
		completePhase: function (project) {
			if (this.model._id !== project) this.setModel (project);
			return this.modPhase ('complete');
		},
		nextPhase: function (project) {
			if (this.model._id !== project) this.setModel (project);
			// var i = 0;
			// while (project.currentPhase._id !== project.phases[i]._id) i++ ;
			// return this.modPhase (project.phases[++i]._id, 'start');
			return this.modPhase ('start');
		},
		publishProject: function (project) {
			if (this.model._id !== project) this.setModel (project);
			return this.publish (true);
		},
		// -------------------------------------------------------------------------
		//
		// start or stop a phase
		//
		// -------------------------------------------------------------------------
		modPhase : function (method) {
			var self = this;
			var url ='/api/project/'+self.model._id;
			if (method === 'complete') url += '/complete/current/phase';
			else if (method === 'start') url += '/start/next/phase';
			return new Promise (function (resolve, reject) {
				self.put (url, self.model)
				.then (function (res) {
					self.model = res;
					self.modelIsNew = false;
					resolve (res);
				}).catch (reject);
			});
		},
		// -------------------------------------------------------------------------
		//
		// publish this project, make it publicly viewable
		//
		// -------------------------------------------------------------------------
		publish: function (willPublish) {
			var self = this;
			var url ='/api/project/'+self.model._id;
			url += willPublish ? '/publish' : '/unpublish';
			return new Promise (function (resolve, reject) {
				self.put (url, self.model)
				.then (function (res) {
					self.model = res;
					self.modelIsNew = false;
					resolve (res);
				}).catch (reject);
			});
		},
		// -------------------------------------------------------------------------
		//
		// submit a project
		//
		// -------------------------------------------------------------------------
		submit: function () {
			return this.put ('/api/project/'+this.model._id+'/submit', this.model);
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
		},
	});
	return new ProjectClass ();
});





