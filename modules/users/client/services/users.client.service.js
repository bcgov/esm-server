'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('users').factory ('UserModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'user',
		forProject: function (projectid) {
			return this.get ('/api/user/for/project/' + projectid);
		},
		me: function () {
			return this.get ('/api/users/me');
		},
		allUsers: function () {
			return this.get ('/api/user');
		}
	});
	return new Class ();
});



// 'use strict';

// // Users service used for communicating with the users REST endpoint
// angular.module('users').factory('Users', ['$resource',
// 	function ($resource) {
// 		return $resource('api/users', {}, {
// 			update: {
// 				method: 'PUT'
// 			}
// 		});
// 	}
// ]);

// //TODO this should be Users service
// angular.module('users.admin').factory('Admin', ['$resource',
// 	function ($resource) {
// 		return $resource('api/users/:userId', {
// 			userId: '@_id'
// 		}, {
// 			update: {
// 				method: 'PUT'
// 			}
// 		});
// 	}
// ]);
