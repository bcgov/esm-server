
'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('topics').factory ('TopicModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'topic',
		getTopicsForPillar: function (pillar) {
			return this.get ('/api/topics/for/pillar/'+pillar);
		},
		forType: function (type) {
			return this.get ('/api/topics/for/type/'+type);
		}
	});
	return new Class ();
});


