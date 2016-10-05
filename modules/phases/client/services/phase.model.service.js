'use strict';
// =========================================================================
//
// phase model and phase base model
//
// =========================================================================
angular.module('project').factory ('PhaseModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var PhaseClass = ModelBase.extend ({
		urlName : 'phase',
		lookup: function (phaseid) {
			return this.get('/api/phase/' + phaseid);
		},
		// -------------------------------------------------------------------------
		//
		// add a milestone, from a base, to a phase
		//
		// -------------------------------------------------------------------------
		addMilestone : function (baseMilestoneId) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.put ('/api/phase/'+self.model._id+'/add/milestone/'+baseMilestoneId, {})
				.then (function (res) {
					self.model = res;
					self.modelIsNew = false;
					resolve (res);
				}).catch (reject);
			});
		},
		// -------------------------------------------------------------------------
		//
		// get phases for a given project / access context
		//
		// -------------------------------------------------------------------------
		userPhases: function (projectId, access) {
			var self = this;
			access = (access === 'write') ? 'write/' : '';
			projectId = (projectId) ? '/in/project/'+projectId : '';
			return new Promise (function (resolve, reject) {
				self.get ('/api/'+access+'phase'+projectId)
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
		phasesForProject: function (id) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.get ('/api/phase/for/project/'+id)
				.then (function (res) {
					self.collection = res;
					resolve (res);
				})
				.catch (reject);
			});
		}
	});
	return new PhaseClass ();
});
angular.module('project').factory ('PhaseBaseModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var PhaseBaseClass = ModelBase.extend ({
		urlName : 'phasebase'
	});
	return new PhaseBaseClass ();
});





