'use strict';

var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

var ProjectGroup = require ('../controllers/projectgroup.controller.js');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'projectgroup', ProjectGroup, policy);

	app.route ('/api/projectgroup/for/project/:project')
		.all (policy ('guest'))
		.get (routes.setAndRun (ProjectGroup, function (ctrl, req) {
			return ctrl.getForProject (req.Project._id);
		}));
};
