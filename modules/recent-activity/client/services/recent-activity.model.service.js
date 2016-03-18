
'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('recent-activity').factory ('RecentActivityModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'recentactivity',
		getRecentActivityActive : function() {
			return this.get ('/api/recentactivity/active/list');
		}
	});
	return new Class ();
});


