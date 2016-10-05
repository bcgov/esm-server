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
		lookup: function (userid) {
			return this.get('/api/user/' + userid);
		},
		rolesInProject: function (projectid) {
			return this.get('/api/user/roles/in/project/' + projectid);
		},
		forProject: function (projectid) {
			return this.get ('/api/user/for/project/' + projectid);
		},
		me: function () {
			return this.get ('/api/users/me');
		},
		allUsers: function () {
			return this.get ('/api/user');
		},
		search: function(name, email, org, groupId) {

			var q = {name: name, email: email, org: org, groupId: groupId};

			var qs = _.reduce(q, function(result, value, key) {
				return (!_.isNull(value) && !_.isUndefined(value)) ? (result += key + '=' + value + '&') : result;
			}, '').slice(0, -1);

			return this.get('/api/search/user?' + qs);
		},
		usersToInvite: function(projectId, name, email, org, groupId) {

			var q = {projectId: projectId, name: name, email: email, org: org, groupId: groupId};

			var qs = _.reduce(q, function(result, value, key) {
				return (!_.isNull(value) && !_.isUndefined(value)) ? (result += key + '=' + value + '&') : result;
			}, '').slice(0, -1);

			return this.get('/api/toinvite/user?' + qs);
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
