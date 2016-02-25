'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('wgcomment').factory ('WGCommentModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'wgcomment',
		getCommentsForPeriod: function (periodId) {
			return this.get ('/api/wgcomments/for/period/'+periodId);
		}
	});
	return new Class ();
});


