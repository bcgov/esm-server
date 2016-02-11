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
		// set a stream into a project, this copies over ALL base objects and makes
		// then real
		//
		// -------------------------------------------------------------------------
		setStream : function (streamId) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.put ('/api/project/'+self.model._id+'/set/stream/'+streamId, {})
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
		// add a phase, form a base phase, to a project. All ancenstors get copied
		//
		// -------------------------------------------------------------------------
		addPhase : function (basePhaseId) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.put ('/api/project/'+self.model._id+'/add/phase/'+basePhaseId, {})
				.then (function (res) {
					self.model = res.data;
					self.modelIsNew = false;
					resolve (res.data);
				}).catch (function (res) {
					reject (res.data);
				});
			});
		}
	});
	return new ProjectClass ();
});





