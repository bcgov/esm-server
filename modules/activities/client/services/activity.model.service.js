'use strict';
// =========================================================================
//
// activity model and activity base model
//
// =========================================================================
angular.module('project').factory ('ActivityModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var ActivityClass = ModelBase.extend ({
		urlName : 'activity',
		// -------------------------------------------------------------------------
		//
		// add a task from a base
		//
		// -------------------------------------------------------------------------
		addTask : function (baseTaskId) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.put ('/api/activity/'+self.model._id+'/add/task/'+baseTaskId, {})
				.then (function (res) {
					self.model = res;
					self.modelIsNew = false;
					resolve (res);
				}).catch (reject);
			});
		},
		// -------------------------------------------------------------------------
		//
		// this will get user activities for a given context of project and/or access
		// if project is blank then all projects is assumed, if access is blank then
		// read access is assumed
		//
		// -------------------------------------------------------------------------
		userActivities: function (projectId, access) {
			var self = this;
			access = (access === 'write') ? 'write/' : '';
			projectId = (projectId) ? '/in/project/'+projectId : '';
			return new Promise (function (resolve, reject) {
				self.get ('/api/'+access+'activity'+projectId)
				.then (function (res) {
					self.collection = res;
					resolve (res);
				})
				.catch (reject);
			});
		},
		// -------------------------------------------------------------------------
		//
		// phases for this project that are readable by this user
		//
		// -------------------------------------------------------------------------
		activitiesForMilestone: function (id) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.get ('/api/activity/for/milestone/'+id)
				.then (function (res) {
					self.collection = res;
					resolve (res);
				})
				.catch (reject);
			});
		},
		// -------------------------------------------------------------------------
		//
		// initiate the data portion of the activity
		//
		// -------------------------------------------------------------------------
		initiateActivityData: function () {
			var self = this;
			return new Promise (function (resolve, reject) {
				//if (self.model.processCode === 'engage-wg') {
					// WGCommentPeriodModel.getNewForProject (self.model.project)
					// .then (function (commentPeriod) {
					// 	self.model.data = commentPeriod;
					// 	return commentPeriod;
					// }).then (resolve, reject);
				//}
			});
		},
		// -------------------------------------------------------------------------
		//
		// save the activity along with its data, do whatever else is required.
		// this essentially starts the activity as it is now linked to data
		//
		// -------------------------------------------------------------------------
		initiateActivity: function () {
			var self = this;
			return new Promise (function (resolve, reject) {
				if (self.model.processCode === 'engage-wg') {
					// WGCommentPeriodModel.setModel (self.model.data)
					// self.saveModel ()
					// WGCommentPeriodModel.getNewForProject (self.model.project)
					// .then (function (commentPeriod) {
					// 	self.model.data = {commentPeriod: commentPeriod._id};
					// 	return commentPeriod;
					// }).then (resolve, reject);
				}
			});
		}
	});
	return new ActivityClass ();
});
angular.module('project').factory ('ActivityBaseModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var ActivityBaseClass = ModelBase.extend ({
		urlName : 'activitybase'
	});
	return new ActivityBaseClass ();
});





