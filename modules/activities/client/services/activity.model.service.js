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
					self.model = res.data;
					self.modelIsNew = false;
					resolve (res.data);
				}).catch (function (res) {
					reject (res.data);
				});
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





