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
		// -------------------------------------------------------------------------
		//
		// add an activity from base to a milestone
		//
		// -------------------------------------------------------------------------
		addActivity : function (baseActivityId) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.put ('/api/milestone/'+self.model._id+'/add/milestone/'+baseActivityId, {})
				.then (function (res) {
					self.model = res.data;
					self.modelIsNew = false;
					resolve (res.data);
				}).catch (function (res) {
					reject (res.data);
				});
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
				self.mget ('/api/'+access+'milestone'+projectId)
				.then (function (res) {
					self.collection = res.data;
					resolve (res.data);
				})
				.catch (function (res) {
					reject (res.data);
				});
			});
		},
		milestonesForPhase: function (id) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.mget ('/api/milestone/for/phase/'+id)
				.then (function (res) {
					self.collection = res.data;
					resolve (res.data);
				})
				.catch (function (res) {
					reject (res.data);
				});
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





