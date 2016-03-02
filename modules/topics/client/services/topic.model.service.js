'use strict';
// =========================================================================
//
// topic model
//
// =========================================================================
angular.module('project').factory ('TopicModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var TopicClass = ModelBase.extend ({
		urlName : 'topic',
		getTopicsForPillar: function (pillar) {
			return new Promise (function (resolve, reject) {
				resolve ([
					{
						code: 'abc',
						name: 'Topic 17'
					},
					{
						code: 'abc',
						name: 'Topic 20'
					}
				]);
			});
		}
	});
	return new TopicClass ();
});
