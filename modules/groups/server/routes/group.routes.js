'use strict';

var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

var Group = require ('../controllers/group.controller.js');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'group', Group, policy);

	app.route ('/api/group/for/project/:project')
		.all (policy ('user'))
		.get (routes.setAndRun (Group, function (ctrl, req) {
			return ctrl.getForProject (req.Project._id);
		}));
};
