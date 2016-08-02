'use strict';
// =========================================================================
//
// milestone model and milestone base model
//
// =========================================================================
angular.module('project').factory ('MilestoneModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var MilestoneClass = ModelBase.extend ({
		urlName : 'milestone',
		lookup: function (milestoneid) {
			return this.get ('/api/milestone/'+milestoneid);
		},
		// -------------------------------------------------------------------------
		//
		// add an activity from base to a milestone
		//
		// -------------------------------------------------------------------------
		addActivity : function (baseActivityId) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.put ('/api/milestone/'+self.model._id+'/add/activity/'+baseActivityId, {})
				.then (function (res) {
					self.model = res;
					self.modelIsNew = false;
					resolve (res);
				}).catch (reject);
			});
		},
		// -------------------------------------------------------------------------
		//
		// get milestones for a given project / access context
		//
		// -------------------------------------------------------------------------
		userMilestones: function (projectId, access) {
			var self = this;
			access = (access === 'write') ? 'write/' : '';
			projectId = (projectId) ? '/in/project/'+projectId : '';
			return new Promise (function (resolve, reject) {
				self.get ('/api/'+access+'milestone'+projectId)
				.then (function (res) {
					self.collection = res;
					resolve (res);
				})
				.catch (reject);
			});
		},
		milestonesForPhase: function (id) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.get ('/api/milestone/for/phase/'+id)
				.then (function (res) {
					self.collection = res;
					resolve (res);
				})
				.catch (reject);
			});
		},
		startMilestone: function(id) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.put ('/api/milestone/start/'+id)
				.then (function (res) {
					resolve (res);
				})
				.catch (reject);
			});
		},
		completeMilestone: function(id) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.put ('/api/milestone/complete/'+id)
				.then (function (res) {
					resolve (res);
				})
				.catch (reject);
			});
		},
		deleteMilestone: function(id) {
			var self = this;
			return new Promise (function (resolve, reject) {
				// Null Check
				if (id) {
					self.delete ('/api/milestone/'+id)
					.then (function (res) {
						self.collection = res;
						resolve (res);
					})
					.catch (reject);
				} else {
					resolve(null);
				}
			});
		}
	});
	return new MilestoneClass ();
});
angular.module('project').factory ('MilestoneBaseModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var MilestoneBaseClass = ModelBase.extend ({
		urlName : 'milestonebase'
	});
	return new MilestoneBaseClass ();
});





