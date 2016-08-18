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
			return ctrl.searchForUsersToInvite(req.query.projectId);
		}));
};
