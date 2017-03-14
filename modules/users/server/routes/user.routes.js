'use strict';

var routes = require('../../../core/server/controllers/core.routes.controller');
var policy = require('../../../core/server/controllers/core.policy.controller');

var User = require('../controllers/user.controller.js');

module.exports = function (app) {
	routes.setCRUDRoutes(app, 'user', User, policy, []);

	app.route('/api/search/user')
		.all(policy('user'))
		.get(routes.setAndRun(User, function (ctrl, req) {
			return ctrl.search(req.query.name, req.query.email, req.query.org, req.query.groupId);
		}));

	app.route('/api/toinvite/user')
		.all(policy('user'))
		.get(routes.setAndRun(User, function (ctrl, req) {
			return ctrl.searchForUsersToInvite(req.query.projectId, req.query.name, req.query.email, req.query.org, req.query.groupId);
		}));

	app.route('/api/user/roles/in/project/:projectid')
		.all(policy('guest'))
		.get(routes.setAndRun(User, function (ctrl, req) {
			// Since opts.userRoles is based on the users' context within the project,
			// we can short circuit and assume this is ok to return without looking for
			// a specific project.
			return new Promise( function (rs, rj) {
				console.log("ctrl.opts.userRoles:", ctrl.opts.userRoles);
				rs(ctrl.opts.userRoles);
			});
		}));

	app.route('/api/user/gnr/:userid')
		.all(policy('user'))
		.get(routes.setAndRun(User, function (ctrl, req) {
			return ctrl.groupsAndRoles(req.params.userid);
		}));

};
